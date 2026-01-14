#!/bin/bash

echo "🔍 Tunnel ve Backend Servis Durumu Kontrolü"
echo "=========================================="
echo ""

# Renk kodları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Cloudflared process kontrolü
echo "1️⃣  Cloudflared Process Kontrolü:"
if pgrep -x "cloudflared" > /dev/null; then
    echo -e "${GREEN}✅ Cloudflared process çalışıyor${NC}"
    ps aux | grep cloudflared | grep -v grep | head -1
else
    echo -e "${RED}❌ Cloudflared process çalışmıyor!${NC}"
fi
echo ""

# 2. Backend servislerine HTTP istekleri
echo "2️⃣  Backend Servis Erişim Kontrolü:"
echo ""

# Keycloak kontrolü
echo -n "Keycloak (https://keycloak.iyihislerapp.com): "
KEYCLOAK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://keycloak.iyihislerapp.com/keycloak/getToken 2>/dev/null || echo "000")
if [ "$KEYCLOAK_STATUS" = "000" ]; then
    echo -e "${RED}❌ Erişilemiyor (timeout/connection error)${NC}"
elif [ "$KEYCLOAK_STATUS" = "405" ] || [ "$KEYCLOAK_STATUS" = "401" ] || [ "$KEYCLOAK_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Erişilebilir (HTTP $KEYCLOAK_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP $KEYCLOAK_STATUS${NC}"
fi

# BPMN kontrolü
echo -n "BPMN (https://bpmn.iyihislerapp.com): "
BPMN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://bpmn.iyihislerapp.com/ 2>/dev/null || echo "000")
if [ "$BPMN_STATUS" = "000" ]; then
    echo -e "${RED}❌ Erişilemiyor (timeout/connection error)${NC}"
elif [ "$BPMN_STATUS" = "404" ] || [ "$BPMN_STATUS" = "200" ] || [ "$BPMN_STATUS" = "401" ]; then
    echo -e "${GREEN}✅ Erişilebilir (HTTP $BPMN_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP $BPMN_STATUS${NC}"
fi

# BFF kontrolü
echo -n "BFF (https://bff.iyihislerapp.com): "
BFF_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://bff.iyihislerapp.com/ 2>/dev/null || echo "000")
if [ "$BFF_STATUS" = "000" ]; then
    echo -e "${RED}❌ Erişilemiyor (timeout/connection error)${NC}"
elif [ "$BFF_STATUS" = "404" ] || [ "$BFF_STATUS" = "200" ] || [ "$BFF_STATUS" = "401" ]; then
    echo -e "${GREEN}✅ Erişilebilir (HTTP $BFF_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP $BFF_STATUS${NC}"
fi

echo ""
echo "3️⃣  Local Servis Port Kontrolü:"
echo ""

# Port kontrolleri
check_port() {
    local port=$1
    local name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $name (port $port) çalışıyor${NC}"
    else
        echo -e "${RED}❌ $name (port $port) çalışmıyor${NC}"
    fi
}

check_port 6700 "Keycloak"
check_port 8082 "BPMN"
check_port 8083 "BFF (PsikoHekim Backend)"

echo ""
echo "=========================================="
echo "📋 Özet:"
echo ""
echo "Eğer cloudflared çalışmıyorsa:"
echo "  ./start-tunnel-simple.sh çalıştırın"
echo ""
echo "Eğer backend servisler erişilemiyorsa:"
echo "  - Tunnel'ı kontrol edin (Cloudflare Dashboard)"
echo "  - Local servislerin çalıştığından emin olun"
echo "  - Backend loglarını kontrol edin"
echo ""

