#!/bin/bash

# Stop all Cloudflare tunnels

echo "🛑 Stopping Cloudflare Tunnels..."

if [ -f .tunnel-pids ]; then
    while read pid; do
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            echo "✅ Stopped tunnel (PID: $pid)"
        fi
    done < .tunnel-pids
    rm -f .tunnel-pids
else
    # Fallback: kill all cloudflared processes
    pkill -f "cloudflared tunnel"
    echo "✅ Stopped all cloudflared tunnel processes"
fi

echo "✅ All tunnels stopped"


