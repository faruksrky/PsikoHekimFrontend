#!/bin/bash

# Cloudflare Pages Environment Variables Otomatik Güncelleyici
# Bu script tunnel URL'lerini Cloudflare Pages'e otomatik gönderir

set -e

# ============================================
# CONFIGURATION
# ============================================

# Cloudflare hesap bilgileri
ACCOUNT_ID="f0fa9863e84eb8b185c549071e97ba2d"
PROJECT_NAME="psikohekimfrontend"

# API Token (güvenlik için environment variable'dan alınır)
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable bulunamadı!"
    echo ""
    echo "Kullanım:"
    echo "  export CLOUDFLARE_API_TOKEN='your-api-token-here'"
    echo "  ./update-cloudflare-env.sh"
    exit 1
fi

# ============================================
# TUNNEL URLs'ı OKU
# ============================================

if [ ! -f "tunnel-urls.txt" ]; then
    echo "❌ Error: tunnel-urls.txt bulunamadı!"
    echo "Önce ./start-tunnels.sh çalıştırın."
    exit 1
fi

echo "📖 Reading tunnel URLs from tunnel-urls.txt..."
source tunnel-urls.txt

# ============================================
# CLOUDFLARE API - Environment Variables Güncelle
# ============================================

echo "🚀 Updating Cloudflare Pages environment variables..."
echo ""

API_URL="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}"

# Environment variables JSON hazırla
ENV_VARS_JSON=$(cat <<EOF
{
  "deployment_configs": {
    "production": {
      "env_vars": {
        "VITE_PSIKOHEKIM_BASE_URL": {"value": "${VITE_PSIKOHEKIM_BASE_URL}"},
        "VITE_KEYCLOAK_BASE_URL": {"value": "${VITE_KEYCLOAK_BASE_URL}"},
        "VITE_BPMN_BASE_URL": {"value": "${VITE_BPMN_BASE_URL}"},
        "VITE_KEYCLOAK_GET_TOKEN_URL": {"value": "${VITE_KEYCLOAK_GET_TOKEN_URL}"},
        "VITE_KEYCLOAK_GET_USER_INFO_URL": {"value": "${VITE_KEYCLOAK_GET_USER_INFO_URL}"},
        "VITE_KEYCLOAK_USERS_URL": {"value": "${VITE_KEYCLOAK_USERS_URL}"},
        "VITE_PATIENT_LIST_URL": {"value": "${VITE_PATIENT_LIST_URL}"},
        "VITE_PATIENT_DETAILS_URL": {"value": "${VITE_PATIENT_DETAILS_URL}"},
        "VITE_PATIENT_SEARCH_URL": {"value": "${VITE_PATIENT_SEARCH_URL}"},
        "VITE_PATIENT_ADD_URL": {"value": "${VITE_PATIENT_ADD_URL}"},
        "VITE_THERAPIST_LIST_URL": {"value": "${VITE_THERAPIST_LIST_URL}"},
        "VITE_THERAPIST_DETAILS_URL": {"value": "${VITE_THERAPIST_DETAILS_URL}"},
        "VITE_THERAPIST_SEARCH_URL": {"value": "${VITE_THERAPIST_SEARCH_URL}"},
        "VITE_THERAPIST_ADD_URL": {"value": "${VITE_THERAPIST_ADD_URL}"},
        "VITE_THERAPIST_PATIENT_PATIENTS_URL": {"value": "${VITE_THERAPIST_PATIENT_PATIENTS_URL}"},
        "NODE_VERSION": {"value": "20.18.0"}
      }
    }
  }
}
EOF
)

# API isteği gönder
RESPONSE=$(curl -s -X PATCH "${API_URL}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${ENV_VARS_JSON}")

# Response kontrol et
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Environment variables başarıyla güncellendi!"
    echo ""
    echo "📋 Güncellenen değişkenler:"
    echo "  • VITE_PSIKOHEKIM_BASE_URL"
    echo "  • VITE_KEYCLOAK_BASE_URL"
    echo "  • VITE_BPMN_BASE_URL"
    echo "  • ... ve diğer tüm endpoint'ler"
    echo ""
    echo "🔄 Şimdi Cloudflare Pages'te yeni deployment tetiklenmeli."
    echo "   Dashboard > Deployments sayfasını kontrol edin."
else
    echo "❌ Error updating environment variables!"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

echo ""
echo "✅ Tamamlandı!"

