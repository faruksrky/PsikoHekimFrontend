#!/bin/bash

echo "🔧 Browser Erişim Sorunları Düzeltme Rehberi"
echo "============================================="
echo ""

echo "1️⃣  DNS Cache Temizleme (macOS):"
echo "   Bu komutu çalıştırın:"
echo "   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder"
echo ""

echo "2️⃣  Hangi URL'yi kullanıyorsunuz?"
echo "   Telefonda hangi URL'yi kullanıyorsunuz?"
echo "   - Preview URL (örn: 1b836a21.psikohekimfrontend.pages.dev)?"
echo "   - Production URL (örn: psikohekimfrontend.pages.dev)?"
echo ""

echo "3️⃣  Browser Cache Temizleme:"
echo "   Chrome: Cmd + Shift + Delete → Cached images → Clear"
echo "   Safari: Cmd + Option + E (clear cache)"
echo ""

echo "4️⃣  Incognito/Private Mode:"
echo "   Chrome: Cmd + Shift + N"
echo "   Safari: Cmd + Shift + N"
echo ""

echo "5️⃣  Hard Refresh:"
echo "   Chrome/Safari: Cmd + Shift + R"
echo ""

