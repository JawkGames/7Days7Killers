$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$BRAIN = "C:\Users\Cemre\.gemini\antigravity\brain\b5d931a5-f9da-409f-9770-793046dd8118"
$ROOT = "d:\Users\CraftC\Desktop\7Days7Killers"
$ASSETS = Join-Path $ROOT "www\assets"
$CLEAN_PS1 = "C:\Users\Cemre\.gemini\config\skills\jawk-game-art\scripts\clean_sprite.ps1"
$TMP_DIR = Join-Path $ROOT "_raw_art"

$RAW = @{
  room_bg    = Join-Path $BRAIN "room_bg_1795771958903.jpg"
  fg_desk    = Join-Path $BRAIN "fg_desk_1795771968122.jpg"
  room_props = Join-Path $BRAIN "room_props_sheet_1795771980243.jpg"
  s1         = Join-Path $BRAIN "suspects_sheet_1_1795771963055.jpg"
  s2         = Join-Path $BRAIN "suspects_sheet_2_1795771973245.jpg"
  s3         = Join-Path $BRAIN "suspects_sheet_3_1795771982248.jpg"
  s4         = Join-Path $BRAIN "suspects_sheet_4_1795771963330.jpg"
  s5         = Join-Path $BRAIN "suspects_sheet_5_1795771974348.jpg"
  loc1       = Join-Path $BRAIN "locations_sheet_1_1795771959115.jpg"
  loc2       = Join-Path $BRAIN "locations_sheet_2_1795771967688.jpg"
  clues      = Join-Path $BRAIN "clues_sheet_1795771976333.jpg"
  ui         = Join-Path $BRAIN "ui_sheet_1795771963529.jpg"
  loss       = Join-Path $BRAIN "endings_loss_sheet_1795771993582.jpg"
}

function Crop-NormAndPad([System.Drawing.Bitmap]$src, [double]$x0, [double]$y0, [double]$x1, [double]$y1, [int]$pad) {
  $sx = [int][Math]::Floor($src.Width * $x0)
  $sy = [int][Math]::Floor($src.Height * $y0)
  $sw = [int][Math]::Max(1, [Math]::Floor($src.Width * ($x1 - $x0)))
  $sh = [int][Math]::Max(1, [Math]::Floor($src.Height * ($y1 - $y0)))
  if ($sx + $sw -gt $src.Width) { $sw = $src.Width - $sx }
  if ($sy + $sh -gt $src.Height) { $sh = $src.Height - $sy }

  $out = New-Object System.Drawing.Bitmap(($sw + $pad * 2), ($sh + $pad * 2), [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($out)
  $g.Clear([System.Drawing.Color]::White)
  $destRect = New-Object System.Drawing.Rectangle($pad, $pad, $sw, $sh)
  $srcRect = New-Object System.Drawing.Rectangle($sx, $sy, $sw, $sh)
  $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  return $out
}

function Clean-Slice([System.Drawing.Bitmap]$src, [double]$x0, [double]$y0, [double]$x1, [double]$y1, [string]$outPng, [int]$pad = 10, [int]$maxDim = 0, [switch]$NoAutoCrop) {
  $tmpIn = Join-Path $TMP_DIR ("slice_" + [Guid]::NewGuid().ToString("N") + ".png")
  $cropped = Crop-NormAndPad $src $x0 $y0 $x1 $y1 $pad
  $cropped.Save($tmpIn, [System.Drawing.Imaging.ImageFormat]::Png)
  $cropped.Dispose()

  if ($NoAutoCrop) {
    & $CLEAN_PS1 -InputPath $tmpIn -OutputPath $outPng -BgThreshold 218 -DefringePasses 3 -NoAutoCrop | Out-Null
  } else {
    & $CLEAN_PS1 -InputPath $tmpIn -OutputPath $outPng -BgThreshold 218 -DefringePasses 3 | Out-Null
  }
  Remove-Item -Force $tmpIn -ErrorAction SilentlyContinue

  if ($maxDim -gt 0) {
    $bmp = [System.Drawing.Bitmap]::FromFile($outPng)
    if ($bmp.Width -gt $maxDim -or $bmp.Height -gt $maxDim) {
      $scale = [Math]::Min($maxDim / [double]$bmp.Width, $maxDim / [double]$bmp.Height)
      $nw = [int][Math]::Max(1, [Math]::Round($bmp.Width * $scale))
      $nh = [int][Math]::Max(1, [Math]::Round($bmp.Height * $scale))
      $res = New-Object System.Drawing.Bitmap($nw, $nh, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      $g = [System.Drawing.Graphics]::FromImage($res)
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.DrawImage($bmp, 0, 0, $nw, $nh)
      $g.Dispose()
      $bmp.Dispose()
      $res.Save($outPng, [System.Drawing.Imaging.ImageFormat]::Png)
      $res.Dispose()
    } else {
      $bmp.Dispose()
    }
  }
}

function Trim-PanelWhiteBorderAndWebp([System.Drawing.Bitmap]$src, [double]$x0, [double]$y0, [double]$x1, [double]$y1, [string]$outWebp, [int]$tw = 960, [int]$th = 540) {
  $panel = Crop-NormAndPad $src $x0 $y0 $x1 $y1 0
  $w = $panel.Width; $h = $panel.Height
  $midY = [int]($h / 2); $midX = [int]($w / 2)

  $left = 0
  while ($left -lt [int]($w / 4)) {
    $c = $panel.GetPixel($left, $midY)
    if (([int]$c.R + [int]$c.G + [int]$c.B) -le 675) { break }
    $left++
  }
  $right = $w - 1
  while ($right -gt [int]($w * 3 / 4)) {
    $c = $panel.GetPixel($right, $midY)
    if (([int]$c.R + [int]$c.G + [int]$c.B) -le 675) { break }
    $right--
  }
  $top = 0
  while ($top -lt [int]($h / 4)) {
    $c = $panel.GetPixel($midX, $top)
    if (([int]$c.R + [int]$c.G + [int]$c.B) -le 675) { break }
    $top++
  }
  $bottom = $h - 1
  while ($bottom -gt [int]($h * 3 / 4)) {
    $c = $panel.GetPixel($midX, $bottom)
    if (([int]$c.R + [int]$c.G + [int]$c.B) -le 675) { break }
    $bottom--
  }

  $inset = 4
  $rx = $left + $inset; $ry = $top + $inset
  $rw = [Math]::Max(10, ($right - $inset) - $rx + 1)
  $rh = [Math]::Max(10, ($bottom - $inset) - $ry + 1)

  $rect = New-Object System.Drawing.Rectangle($rx, $ry, $rw, $rh)
  $trimmed = $panel.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $panel.Dispose()

  $tmpPng = Join-Path $TMP_DIR ("webp_" + [Guid]::NewGuid().ToString("N") + ".png")
  $trimmed.Save($tmpPng, [System.Drawing.Imaging.ImageFormat]::Png)
  $trimmed.Dispose()

  & ffmpeg -y -loglevel error -i $tmpPng -vf ("scale=" + $tw + ":" + $th) -c:v libwebp -lossless 0 -quality 92 $outWebp
  Remove-Item -Force $tmpPng -ErrorAction SilentlyContinue
}

Write-Output "1) Room layers..."
& ffmpeg -y -loglevel error -i $RAW.room_bg -vf "scale=1920:1080" -c:v libwebp -lossless 0 -quality 92 (Join-Path $ASSETS "room\room_bg.webp")

$deskSrc = [System.Drawing.Bitmap]::FromFile($RAW.fg_desk)
$deskOut = Join-Path $ASSETS "room\fg_desk.png"
Clean-Slice $deskSrc 0.0 0.42 1.0 1.0 $deskOut 0 1600 -NoAutoCrop
$deskSrc.Dispose()

$propsSrc = [System.Drawing.Bitmap]::FromFile($RAW.room_props)
Clean-Slice $propsSrc 0.01 0.02 0.32 0.98 (Join-Path $ASSETS "room\chair.png") 10 560
Clean-Slice $propsSrc 0.35 0.00 0.65 0.98 (Join-Path $ASSETS "room\bulb.png") 8 520
Clean-Slice $propsSrc 0.68 0.02 0.99 0.98 (Join-Path $ASSETS "room\door_ajar.png") 10 580
$propsSrc.Dispose()

Write-Output "2) 20 Suspect busts..."
$suspectSheets = @(
  @{ Key = "s1"; Names = @("halit", "leyla", "rustem", "muzeyyen") },
  @{ Key = "s2"; Names = @("ilyas", "cevdet", "vahap", "sevgi") },
  @{ Key = "s3"; Names = @("kirkor", "kudret", "adem", "nermin") },
  @{ Key = "s4"; Names = @("baran", "feride", "salih", "orhan") },
  @{ Key = "s5"; Names = @("musa", "zeliha", "tahir", "riza") }
)
$quads = @(
  @(0.00, 0.00, 0.50, 0.50),
  @(0.50, 0.00, 1.00, 0.50),
  @(0.00, 0.50, 0.50, 1.00),
  @(0.50, 0.50, 1.00, 1.00)
)
foreach ($entry in $suspectSheets) {
  $bmp = [System.Drawing.Bitmap]::FromFile($RAW[$entry.Key])
  for ($i = 0; $i -lt 4; $i++) {
    $nm = $entry.Names[$i]
    $q = $quads[$i]
    Clean-Slice $bmp $q[0] $q[1] $q[2] $q[3] (Join-Path $ASSETS ("suspects\" + $nm + ".png")) 10 680
  }
  $bmp.Dispose()
}

Write-Output "3) 6 Crime scene locations & 6 Ending plates..."
$loc1Bmp = [System.Drawing.Bitmap]::FromFile($RAW.loc1)
Trim-PanelWhiteBorderAndWebp $loc1Bmp 0.005 0.010 0.490 0.488 (Join-Path $ASSETS "locations\degirmen.webp")
Trim-PanelWhiteBorderAndWebp $loc1Bmp 0.510 0.010 0.995 0.488 (Join-Path $ASSETS "locations\demirci.webp")
Trim-PanelWhiteBorderAndWebp $loc1Bmp 0.005 0.512 0.490 0.990 (Join-Path $ASSETS "locations\sapel.webp")
Trim-PanelWhiteBorderAndWebp $loc1Bmp 0.510 0.512 0.995 0.990 (Join-Path $ASSETS "locations\eczane.webp")
$loc1Bmp.Dispose()

$loc2Bmp = [System.Drawing.Bitmap]::FromFile($RAW.loc2)
Trim-PanelWhiteBorderAndWebp $loc2Bmp 0.005 0.010 0.495 0.490 (Join-Path $ASSETS "locations\han.webp")
Trim-PanelWhiteBorderAndWebp $loc2Bmp 0.505 0.010 0.995 0.490 (Join-Path $ASSETS "locations\kayikhane.webp")
Trim-PanelWhiteBorderAndWebp $loc2Bmp 0.005 0.510 0.495 0.990 (Join-Path $ASSETS "endings\crowd_calm.webp")
Trim-PanelWhiteBorderAndWebp $loc2Bmp 0.505 0.510 0.995 0.990 (Join-Path $ASSETS "endings\crowd_riot.webp")
$loc2Bmp.Dispose()

$lossBmp = [System.Drawing.Bitmap]::FromFile($RAW.loss)
Trim-PanelWhiteBorderAndWebp $lossBmp 0.005 0.010 0.495 0.490 (Join-Path $ASSETS "endings\loss_family.webp")
Trim-PanelWhiteBorderAndWebp $lossBmp 0.505 0.010 0.995 0.490 (Join-Path $ASSETS "endings\loss_bench.webp")
Trim-PanelWhiteBorderAndWebp $lossBmp 0.005 0.510 0.495 0.990 (Join-Path $ASSETS "endings\loss_cats.webp")
Trim-PanelWhiteBorderAndWebp $lossBmp 0.505 0.510 0.995 0.990 (Join-Path $ASSETS "endings\loss_workshop.webp")
$lossBmp.Dispose()

Write-Output "4) 12 Physical clue sprites..."
$cluesBmp = [System.Drawing.Bitmap]::FromFile($RAW.clues)
$clueBoxes = @{
  red_yarn          = @(0.02, 0.04, 0.18, 0.34)
  muddy_boot        = @(0.20, 0.02, 0.33, 0.36)
  blacksmith_hammer = @(0.35, 0.03, 0.49, 0.36)
  pocket_watch      = @(0.51, 0.04, 0.65, 0.34)
  amber_vial        = @(0.04, 0.37, 0.16, 0.65)
  empty_nail        = @(0.35, 0.37, 0.49, 0.64)
  brass_key         = @(0.53, 0.37, 0.63, 0.64)
  torn_letter       = @(0.67, 0.38, 0.82, 0.64)
  broken_beads      = @(0.17, 0.67, 0.33, 0.97)
  cigar_stub        = @(0.34, 0.72, 0.50, 0.92)
  bloodied_bandage  = @(0.51, 0.70, 0.66, 0.94)
  iron_shears       = @(0.83, 0.49, 0.98, 0.98)
}
foreach ($k in $clueBoxes.Keys) {
  $b = $clueBoxes[$k]
  Clean-Slice $cluesBmp $b[0] $b[1] $b[2] $b[3] (Join-Path $ASSETS ("clues\" + $k + ".png")) 10 256
}
$cluesBmp.Dispose()

Write-Output "5) UI plates & Detective Notebook..."
$uiBmp = [System.Drawing.Bitmap]::FromFile($RAW.ui)
Clean-Slice $uiBmp 0.02 0.04 0.49 0.38 (Join-Path $ASSETS "ui\btn_dark.png") 8 640
Clean-Slice $uiBmp 0.51 0.04 0.98 0.38 (Join-Path $ASSETS "ui\btn_blood.png") 8 640
Clean-Slice $uiBmp 0.02 0.48 0.25 0.92 (Join-Path $ASSETS "ui\btn_square.png") 8 256
Clean-Slice $uiBmp 0.25 0.44 0.49 0.95 (Join-Path $ASSETS "ui\polaroid_frame.png") 8 520

$nbTmp = Join-Path $TMP_DIR "nb_clean.png"
Clean-Slice $uiBmp 0.50 0.40 0.99 0.98 $nbTmp 8 1280
& ffmpeg -y -loglevel error -i $nbTmp -c:v libwebp -lossless 0 -quality 92 (Join-Path $ASSETS "ui\notebook_spread.webp")
Remove-Item -Force $nbTmp -ErrorAction SilentlyContinue
$uiBmp.Dispose()

Write-Output "6) Downloading real CC0 Kenney SFX..."
$rpgBase = "https://raw.githubusercontent.com/Calinou/kenney-rpg-audio/master/addons/kenney_rpg_audio/sounds/"
$uiBase  = "https://raw.githubusercontent.com/Calinou/kenney-interface-sounds/master/addons/kenney_interface_sounds/sounds/"
$sfxUrls = @{
  "click_1.ogg"   = $uiBase + "click_001.ogg"
  "click_2.ogg"   = $uiBase + "click_002.ogg"
  "click_3.ogg"   = $uiBase + "click_003.ogg"
  "page_1.ogg"    = $rpgBase + "bookFlip1.ogg"
  "page_2.ogg"    = $rpgBase + "bookFlip2.ogg"
  "page_3.ogg"    = $rpgBase + "bookFlip3.ogg"
  "door_1.ogg"    = $rpgBase + "doorOpen_1.ogg"
  "door_2.ogg"    = $rpgBase + "doorOpen_2.ogg"
  "step_1.ogg"    = $rpgBase + "footstep00.ogg"
  "step_2.ogg"    = $rpgBase + "footstep01.ogg"
  "step_3.ogg"    = $rpgBase + "footstep02.ogg"
  "clue_1.ogg"    = $rpgBase + "bookPlace1.ogg"
  "clue_2.ogg"    = $rpgBase + "bookPlace2.ogg"
  "verdict_1.ogg" = $rpgBase + "doorClose_1.ogg"
  "verdict_2.ogg" = $rpgBase + "doorClose_2.ogg"
}
$dlOk = 0
foreach ($fn in $sfxUrls.Keys) {
  $dest = Join-Path $ASSETS ("sfx\" + $fn)
  try {
    Invoke-WebRequest -Uri $sfxUrls[$fn] -OutFile $dest -UseBasicParsing -TimeoutSec 12
    if ((Get-Item $dest).Length -gt 200) { $dlOk++ }
  } catch {
    # Try alternate path without /sounds/ if repo structure omits it
    try {
      $alt = $sfxUrls[$fn].Replace("/sounds/", "/")
      Invoke-WebRequest -Uri $alt -OutFile $dest -UseBasicParsing -TimeoutSec 12
      if ((Get-Item $dest).Length -gt 200) { $dlOk++ }
    } catch {
      Write-Output ("SFX warn: " + $fn)
    }
  }
}
Write-Output ("SFX_DOWNLOADED: " + $dlOk + "/" + $sfxUrls.Count)
Write-Output "ALL_ASSETS_DONE"
