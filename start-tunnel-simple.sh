#!/bin/bash

echo "🚇 Cloudflare Named Tunnel Başlatıcı"
echo "===================================="
echo ""

# Config dosyası kontrolü
CONFIG_FILE="$HOME/.cloudflared/config.yml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Config dosyası bulunamadı: $CONFIG_FILE"
    exit 1
fi

echo "✅ Config dosyası bulundu: $CONFIG_FILE"
echo ""

# Eski tunnel process'i durdur
echo "🛑 Eski tunnel process'lerini durduruyoruz..."
pkill -f "cloudflared tunnel.*psikohekim-backend" 2>/dev/null
pkill -f "cloudflared tunnel --url" 2>/dev/null
sleep 2

# Tunnel'ı başlat
echo "🚀 Tunnel'ı başlatıyoruz..."
cd "$HOME"

nohup cloudflared tunnel --config "$CONFIG_FILE" run psikohekim-backend > /tmp/cloudflared-tunnel.log 2>&1 &
TUNNEL_PID=$!

echo "$TUNNEL_PID" > /Users/fs648/Desktop/PsikoHekim/PsikoHekimFrontend/.named-tunnel-pid

sleep 5

# Kontrol et
if ps -p $TUNNEL_PID > /dev/null 2>&1; then
    echo "✅ Tunnel başarıyla başlatıldı!"
    echo "   PID: $TUNNEL_PID"
    echo ""
    echo "📋 Route'lar:"
    echo "   - https://keycloak.iyihislerapp.com → localhost:6700"
    echo "   - https://bpmn.iyihislerapp.com → localhost:8082"
    echo "   - https://bff.iyihislerapp.com → localhost:8083"
    echo ""
    echo "🔍 Loglar:"
    echo "   tail -f /tmp/cloudflared-tunnel.log"
    echo ""
    echo "🛑 Durdurmak için:"
    echo "   kill $TUNNEL_PID"
    echo ""
    echo "📊 Dashboard kontrol:"
    echo "   https://one.dash.cloudflare.com → Zero Trust → Networks → Tunnels"
    echo "   Tunnel durumu 'Healthy' olmalı"
else
    echo "❌ Tunnel başlatılamadı!"
    echo "📋 Logları kontrol edin:"
    cat /tmp/cloudflared-tunnel.log
    exit 1
fi

