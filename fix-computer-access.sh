#!/bin/bash

echo "🖥️  Bilgisayar Erişim Sorunu Çözücü"
echo "===================================="
echo ""

echo "1️⃣  DNS Cache Temizleme:"
echo "   Terminal'de şu komutları çalıştırın:"
echo "   sudo dscacheutil -flushcache"
echo "   sudo killall -HUP mDNSResponder"
echo ""

echo "2️⃣  Browser Cache Temizleme:"
echo "   - Chrome/Edge: Cmd+Shift+Delete → 'Cached images and files' → Clear"
echo "   - Firefox: Cmd+Shift+Delete → 'Cache' → Clear"
echo "   - Veya Private/Incognito modda deneyin"
echo ""

echo "3️⃣  Firewall Kontrolü:"
echo "   System Settings → Network → Firewall"
echo "   Cloudflare Tunnel'a izin verildiğinden emin olun"
echo ""

echo "4️⃣  Farklı Browser Deneyin:"
echo "   - Chrome"
echo "   - Firefox"
echo "   - Safari"
echo ""

echo "5️⃣  Host Dosyası Kontrolü:"
echo "   cat /etc/hosts | grep -i cloudflare"
echo "   Eğer engelleyici bir satır varsa, silin"
echo ""

echo "6️⃣  VPN/Proxy Kontrolü:"
echo "   VPN veya proxy kullanıyorsanız, kapatıp deneyin"
echo ""

echo "7️⃣  Network Ayarı Kontrolü:"
echo "   - Bilgisayar ve telefon aynı ağdaysa (WiFi), DNS ayarlarını kontrol edin"
echo "   - Farklı ağlardaysa, bu normal (telefon farklı DNS kullanıyor olabilir)"
echo ""
