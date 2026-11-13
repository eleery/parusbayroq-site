#!/usr/bin/env bash
# Uploads the built site (dist/) to Beget over FTP (TLS when the server offers it).
# Modes:
#   check  — only lists the hosting folders, changes nothing;
#   deploy — downloads a full backup, moves the current site into OLD-<date> next to public_html
#            (outside the web root, so it is not public), then uploads dist/;
#   update — uploads dist/ over the current site (for later releases).
# Kept in place in every mode: api/ (Telegram form), .htaccess, .well-known/, cgi-bin/,
# search engine verification files (yandex_*.html, google*.html).
# Needs env: HOST, USER, PASS; optional SITE_DIR (auto-detected).
set -euo pipefail
MODE="${1:-check}"
STAMP=$(date -u +%Y-%m-%d_%H%M)
KEEP='^(api|\.htaccess|\.well-known|cgi-bin|yandex_[0-9a-f]+\.html|google[0-9a-z]+\.html|\.|\.\.)$'

# Certificate check is off because Beget's FTP certificate may not match the host name; traffic stays encrypted.
lf() { lftp -u "$USER,$PASS" -e "set ftp:ssl-allow yes; set ssl:verify-certificate no; set net:max-retries 2; set net:timeout 30; $1; bye" "$HOST" </dev/null; }

if [ -z "${SITE_DIR:-}" ]; then
  if lf "cls -1 public_html" >/dev/null 2>&1; then SITE_DIR=public_html; else SITE_DIR=parusbayroq.uz/public_html; fi
fi
PARENT=$(dirname "$SITE_DIR")
OLD="$PARENT/OLD-$STAMP"
echo "mode=$MODE site_dir=$SITE_DIR"

echo "== FTP root"; lf "cls -la /" || true
echo "== $PARENT"; lf "cls -la $PARENT" || true
echo "== $SITE_DIR"; lf "cls -la $SITE_DIR"
if [ "$MODE" = check ]; then
  echo "== $SITE_DIR/.htaccess"; lf "cat $SITE_DIR/.htaccess" || true
  echo "== $SITE_DIR/api"; lf "cls -la $SITE_DIR/api" || true
  echo "== $SITE_DIR/fold"; lf "cls -la $SITE_DIR/fold" || true
  exit 0
fi

[ -f dist/index.html ] || { echo "dist/ is missing — build first"; exit 1; }

if [ "$MODE" = deploy ]; then
  echo "== backup"
  mkdir -p backup/site
  lf "mirror --verbose=0 $SITE_DIR backup/site"
  echo "backup files: $(find backup/site -type f | wc -l)"
  echo "== moving current site to $OLD"
  lf "mkdir -p $OLD"
  lf "cd $SITE_DIR; cls -1a" | sed 's#/$##' | grep -Ev "$KEEP" | while IFS= read -r name; do
    [ -n "$name" ] || continue
    echo "move: $name"
    lf "mv \"$SITE_DIR/$name\" \"$OLD/$name\""
  done
  if [ -f backup/site/.htaccess ]; then lf "put backup/site/.htaccess -o $OLD/.htaccess"; echo "copied .htaccess to $OLD"; fi
fi

echo "== upload"
lf "mirror -R --verbose=1 --parallel=4 dist $SITE_DIR"

echo "== check live site"
sleep 5
curl -fsS https://parusbayroq.uz/ | grep -q 'Ташкенте | Parus Bayroq' && echo "OK: new homepage is live"
curl -fsS -o /dev/null -w 'uz: %{http_code}\n' https://parusbayroq.uz/uz/
curl -fsS -o /dev/null -w 'flagi-na-zakaz: %{http_code}\n' https://parusbayroq.uz/flagi-na-zakaz/
curl -sS -o /dev/null -w 'api/telegram.php (405 expected for GET): %{http_code}\n' https://parusbayroq.uz/api/telegram.php
