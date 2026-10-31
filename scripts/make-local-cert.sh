#!/usr/bin/env bash
# Generate the self-signed certificate for the plugin's local HTTPS OAuth
# callback (WHOOP rejects plain-HTTP redirect URIs).
#
# Usage: bash scripts/make-local-cert.sh [dataDir]
# Default dataDir: ~/.dsh-whoop-easy-connect
set -euo pipefail

DATA_DIR="${1:-$HOME/.dsh-whoop-easy-connect}"
TLS_DIR="$DATA_DIR/tls"
mkdir -p "$TLS_DIR"
chmod 700 "$DATA_DIR" "$TLS_DIR"

openssl req -x509 -newkey rsa:2048 -sha256 -nodes -days 825 \
  -keyout "$TLS_DIR/key.pem" -out "$TLS_DIR/cert.pem" \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" >/dev/null 2>&1
chmod 600 "$TLS_DIR/key.pem"
chmod 644 "$TLS_DIR/cert.pem"

echo "created $TLS_DIR/cert.pem and $TLS_DIR/key.pem"
openssl x509 -in "$TLS_DIR/cert.pem" -noout -subject -dates
