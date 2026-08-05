#!/bin/sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ARCH="$(uname -m)"

case "$ARCH" in
  arm64) ESBUILD="$ROOT/tools/esbuild-darwin-arm64" ;;
  x86_64) ESBUILD="$ROOT/tools/esbuild-darwin-x64" ;;
  *) echo "Unsupported macOS architecture: $ARCH" >&2; exit 1 ;;
esac

if [ ! -x "$ESBUILD" ]; then
  echo "Missing or non-executable esbuild binary: $ESBUILD" >&2
  exit 1
fi

TMP="$ROOT/.build-tmp"
cleanup() {
  rm -rf "$TMP"
}
trap cleanup EXIT HUP INT TERM

rm -rf "$TMP"
mkdir -p "$TMP"

"$ESBUILD" "$ROOT/src/app.jsx" \
  --bundle \
  --loader:.jsx=jsx \
  --jsx-factory=React.createElement \
  --jsx-fragment=React.Fragment \
  --platform=browser \
  --target=es2018 \
  --format=iife \
  --sourcemap=inline \
  --banner:js='/* GENERATED FILE. EDIT src/, THEN RUN BUILD. */' \
  --outfile="$TMP/app.js"

mkdir -p "$ROOT/dist"
mv "$TMP/app.js" "$ROOT/dist/app.js"
echo "Built dist/app.js"
