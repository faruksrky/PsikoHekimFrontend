#!/bin/bash

# PsikoHekim Backend Cloudflare Tunnel Starter
# Bu script 3 servisi tunnel ile açar ve URL'leri yakalar

echo "🚀 Starting Cloudflare Tunnels for PsikoHekim Backend..."
echo ""

# Temporary files for logs
BACKEND_LOG=$(mktemp)
KEYCLOAK_LOG=$(mktemp)
BPMN_LOG=$(mktemp)

# Start tunnels in background and capture output
echo "📡 Starting Backend tunnel (port 8083)..."
cloudflared tunnel --url http://localhost:8083 > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

echo "📡 Starting Keycloak tunnel (port 6700)..."
cloudflared tunnel --url http://localhost:6700 > "$KEYCLOAK_LOG" 2>&1 &
KEYCLOAK_PID=$!

echo "📡 Starting BPMN tunnel (port 8082)..."
cloudflared tunnel --url http://localhost:8082 > "$BPMN_LOG" 2>&1 &
BPMN_PID=$!

echo ""
echo "⏳ Waiting for tunnels to initialize (10 seconds)..."
sleep 10

# Extract URLs from logs
echo ""
echo "============================================"
echo "✅ TUNNEL URLs (COPY THESE!):"
echo "============================================"
echo ""

BACKEND_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$BACKEND_LOG" | head -1)
KEYCLOAK_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$KEYCLOAK_LOG" | head -1)
BPMN_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$BPMN_LOG" | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo "⚠️  Backend URL not found yet, checking log..."
    cat "$BACKEND_LOG"
    BACKEND_URL="PENDING"
fi

if [ -z "$KEYCLOAK_URL" ]; then
    echo "⚠️  Keycloak URL not found yet, checking log..."
    cat "$KEYCLOAK_LOG"
    KEYCLOAK_URL="PENDING"
fi

if [ -z "$BPMN_URL" ]; then
    echo "⚠️  BPMN URL not found yet, checking log..."
    cat "$BPMN_LOG"
    BPMN_URL="PENDING"
fi

echo "1️⃣  BACKEND (8083):"
echo "   $BACKEND_URL"
echo ""
echo "2️⃣  KEYCLOAK (6700):"
echo "   $KEYCLOAK_URL"
echo ""
echo "3️⃣  BPMN (8082):"
echo "   $BPMN_URL"
echo ""
echo "============================================"
echo ""

# Save URLs to file for later use
cat > tunnel-urls.txt << EOF
# PsikoHekim Backend Tunnel URLs
# Generated: $(date)

VITE_PSIKOHEKIM_BASE_URL=$BACKEND_URL
VITE_KEYCLOAK_BASE_URL=$KEYCLOAK_URL
VITE_BPMN_BASE_URL=$BPMN_URL

# Keycloak Endpoints
VITE_KEYCLOAK_GET_TOKEN_URL=$KEYCLOAK_URL/keycloak/getToken
VITE_KEYCLOAK_GET_USER_INFO_URL=$KEYCLOAK_URL/keycloak/userInfo
VITE_KEYCLOAK_USERS_URL=$KEYCLOAK_URL/users

# Patient Endpoints
VITE_PATIENT_LIST_URL=$BACKEND_URL/patient/all
VITE_PATIENT_DETAILS_URL=$BACKEND_URL/patient/details
VITE_PATIENT_SEARCH_URL=$BACKEND_URL/patient/search
VITE_PATIENT_ADD_URL=/patient/addPatient

# Therapist Endpoints
VITE_THERAPIST_LIST_URL=$BACKEND_URL/therapist/all
VITE_THERAPIST_DETAILS_URL=$BACKEND_URL/therapist/details
VITE_THERAPIST_SEARCH_URL=$BACKEND_URL/therapist/search
VITE_THERAPIST_ADD_URL=$BACKEND_URL/therapist/addTherapist

# Therapist-Patient
VITE_THERAPIST_PATIENT_PATIENTS_URL=$BACKEND_URL/therapist-patient
EOF

echo "📝 URLs saved to: tunnel-urls.txt"
echo ""
echo "📋 Next Steps:"
echo "   1. Copy these URLs to Cloudflare Pages > Settings > Environment Variables"
echo "   2. Redeploy your frontend"
echo ""
echo "🔴 To stop tunnels: ./stop-tunnels.sh"
echo "📊 Process IDs:"
echo "   Backend: $BACKEND_PID"
echo "   Keycloak: $KEYCLOAK_PID"
echo "   BPMN: $BPMN_PID"
echo ""

# Save PIDs for cleanup script
cat > .tunnel-pids << EOF
$BACKEND_PID
$KEYCLOAK_PID
$BPMN_PID
EOF

# Keep script running and show live logs
echo "============================================"
echo "📡 LIVE TUNNEL LOGS (Ctrl+C to stop)"
echo "============================================"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping tunnels..."
    kill $BACKEND_PID $KEYCLOAK_PID $BPMN_PID 2>/dev/null
    rm -f "$BACKEND_LOG" "$KEYCLOAK_LOG" "$BPMN_LOG" .tunnel-pids
    echo "✅ Tunnels stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Show live logs
tail -f "$BACKEND_LOG" "$KEYCLOAK_LOG" "$BPMN_LOG" 2>/dev/null


