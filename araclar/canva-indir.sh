#!/usr/bin/env bash
# Canva dışa aktarma bağlantısından (export-download.canva.com) tam boy resmi indirir.
# Kullanım: bash araclar/canva-indir.sh "<bağlantı>" <çıktı.png>
# Yalnızca Canva'nın indirme adresine ve depo içindeki bir dosyaya izin verir.
set -euo pipefail
url="${1:?bağlantı gerekli}"; cikti="${2:?çıktı dosyası gerekli}"
case "$url" in
  https://export-download.canva.com/*) ;;
  *) echo "Yalnızca export-download.canva.com bağlantıları indirilir" >&2; exit 1 ;;
esac
case "$cikti" in
  /*|*..*) echo "Çıktı depo içinde göreli bir yol olmalı" >&2; exit 1 ;;
esac
mkdir -p "$(dirname "$cikti")"
curl -fsSL --max-filesize 50000000 -o "$cikti" "$url"
echo "indirildi: $cikti ($(stat -c %s "$cikti") bayt)"
