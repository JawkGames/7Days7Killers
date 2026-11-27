param(
    [Parameter(Mandatory=$true)][string]$InputPath,
    [Parameter(Mandatory=$true)][string]$OutputPath,
    [int]$BgThreshold = 215,
    [int]$DefringePasses = 3,
    [int]$CropX0 = -1,
    [int]$CropY0 = -1,
    [int]$CropX1 = -1,
    [int]$CropY1 = -1,
    [int]$RotateDeg = 0,
    [switch]$NoAutoCrop
)

Add-Type -AssemblyName System.Drawing

function Remove-WhiteBgAndDefringe([System.Drawing.Bitmap]$bmp, [int]$thresh, [int]$passes) {
    $w = $bmp.Width; $h = $bmp.Height
    $out = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $visited = New-Object 'bool[]' ($w * $h)
    $q = New-Object 'System.Collections.Generic.Queue[int]'

    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $srcData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $dstData = $out.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bytes = New-Object 'byte[]' ($w * $h * 4)
    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $bytes, 0, $bytes.Length)
    $bmp.UnlockBits($srcData)

    # 1) Dış kenarlardan Flood-Fill (İç beyazları korur)
    for ($x = 0; $x -lt $w; $x++) {
        $q.Enqueue($x); $visited[$x] = $true
        $idx = ($h - 1) * $w + $x
        $q.Enqueue($idx); $visited[$idx] = $true
    }
    for ($y = 1; $y -lt $h - 1; $y++) {
        $idx1 = $y * $w; $q.Enqueue($idx1); $visited[$idx1] = $true
        $idx2 = $y * $w + ($w - 1); $q.Enqueue($idx2); $visited[$idx2] = $true
    }

    while ($q.Count -gt 0) {
        $idx = $q.Dequeue()
        $p = $idx * 4
        $b = $bytes[$p]; $g = $bytes[$p+1]; $r = $bytes[$p+2]
        if ($r -ge $thresh -and $g -ge $thresh -and $b -ge $thresh) {
            $bytes[$p+3] = 0
            $x = $idx % $w; $y = [int][Math]::Floor($idx / $w)
            if ($x -gt 0) { $n = $idx - 1; if (-not $visited[$n]) { $visited[$n] = $true; $q.Enqueue($n) } }
            if ($x -lt $w - 1) { $n = $idx + 1; if (-not $visited[$n]) { $visited[$n] = $true; $q.Enqueue($n) } }
            if ($y -gt 0) { $n = $idx - $w; if (-not $visited[$n]) { $visited[$n] = $true; $q.Enqueue($n) } }
            if ($y -lt $h - 1) { $n = $idx + $w; if (-not $visited[$n]) { $visited[$n] = $true; $q.Enqueue($n) } }
        }
    }

    # 2) Çok geçişli Defringe (Şeffaf piksele komşu gri/beyaz hareleri temizle)
    for ($pass = 0; $pass -lt $passes; $pass++) {
        $toClear = New-Object 'System.Collections.Generic.List[int]'
        for ($y = 1; $y -lt $h - 1; $y++) {
            for ($x = 1; $x -lt $w - 1; $x++) {
                $idx = $y * $w + $x; $p = $idx * 4
                if ($bytes[$p+3] -eq 0) { continue }
                $adjTrans = ($bytes[($idx-1)*4+3] -eq 0 -or $bytes[($idx+1)*4+3] -eq 0 -or $bytes[($idx-$w)*4+3] -eq 0 -or $bytes[($idx+$w)*4+3] -eq 0)
                if ($adjTrans) {
                    $b = $bytes[$p]; $g = $bytes[$p+1]; $r = $bytes[$p+2]
                    $lum = ($r + $g + $b) / 3.0
                    $maxC = [Math]::Max($r, [Math]::Max($g, $b))
                    $minC = [Math]::Min($r, [Math]::Min($g, $b))
                    if ($lum -gt 105 -and ($maxC - $minC) -lt 45) { $toClear.Add($idx) }
                }
            }
        }
        foreach ($idx in $toClear) { $bytes[$idx*4+3] = 0 }
    }

    # 3) Dış kontur koyulaştırma (Koyu arka planlarda beyaz parlama kalmaması için)
    for ($y = 1; $y -lt $h - 1; $y++) {
        for ($x = 1; $x -lt $w - 1; $x++) {
            $idx = $y * $w + $x; $p = $idx * 4
            if ($bytes[$p+3] -eq 0) { continue }
            $adjTrans = ($bytes[($idx-1)*4+3] -eq 0 -or $bytes[($idx+1)*4+3] -eq 0 -or $bytes[($idx-$w)*4+3] -eq 0 -or $bytes[($idx+$w)*4+3] -eq 0)
            if ($adjTrans) {
                $lum = ($bytes[$p] + $bytes[$p+1] + $bytes[$p+2]) / 3.0
                if ($lum -gt 65) {
                    $bytes[$p] = [byte]($bytes[$p] * 0.45)
                    $bytes[$p+1] = [byte]($bytes[$p+1] * 0.45)
                    $bytes[$p+2] = [byte]($bytes[$p+2] * 0.45)
                }
            }
        }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $dstData.Scan0, $bytes.Length)
    $out.UnlockBits($dstData)
    return $out
}

$raw = [System.Drawing.Bitmap]::FromFile($InputPath)
$clean = Remove-WhiteBgAndDefringe $raw $BgThreshold $DefringePasses
$raw.Dispose()

# Bölge kırpma (isteğe bağlı)
if ($CropX0 -ge 0 -and $CropY0 -ge 0 -and $CropX1 -ge $CropX0 -and $CropY1 -ge $CropY0) {
    $rect = New-Object System.Drawing.Rectangle($CropX0, $CropY0, ($CropX1 - $CropX0 + 1), ($CropY1 - $CropY0 + 1))
    $sub = $clean.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $clean.Dispose()
    $clean = $sub
}

# Döndürme (isteğe bağlı)
if ($RotateDeg -ne 0) {
    $rad = $RotateDeg * [Math]::PI / 180.0
    $cos = [Math]::Abs([Math]::Cos($rad)); $sin = [Math]::Abs([Math]::Sin($rad))
    $nw = [int][Math]::Ceiling($clean.Width * $cos + $clean.Height * $sin)
    $nh = [int][Math]::Ceiling($clean.Width * $sin + $clean.Height * $cos)
    $rot = New-Object System.Drawing.Bitmap($nw, $nh, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($rot)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TranslateTransform($nw / 2.0, $nh / 2.0)
    $g.RotateTransform($RotateDeg)
    $g.TranslateTransform(-$clean.Width / 2.0, -$clean.Height / 2.0)
    $g.DrawImage($clean, 0, 0)
    $g.Dispose(); $clean.Dispose(); $clean = $rot
}

# Auto-Crop (boş şeffaf kenarları kırp)
if (-not $NoAutoCrop) {
    $w = $clean.Width; $h = $clean.Height
    $r2 = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $d = $clean.LockBits($r2, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $b = New-Object 'byte[]' ($w * $h * 4)
    [System.Runtime.InteropServices.Marshal]::Copy($d.Scan0, $b, 0, $b.Length)
    $clean.UnlockBits($d)

    $minX = $w; $minY = $h; $maxX = -1; $maxY = -1
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            if ($b[($y * $w + $x) * 4 + 3] -gt 8) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    if ($maxX -ge $minX) {
        $cw = $maxX - $minX + 1; $ch = $maxY - $minY + 1
        $trimmed = $clean.Clone((New-Object System.Drawing.Rectangle($minX, $minY, $cw, $ch)), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $clean.Dispose()
        $clean = $trimmed
    }
}

$outDir = Split-Path -Parent $OutputPath
if ($outDir -and -not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$clean.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved clean sprite: $OutputPath ($($clean.Width)x$($clean.Height))"
$clean.Dispose()
