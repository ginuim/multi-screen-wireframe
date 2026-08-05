#!/bin/sh
set -eu

SKILL_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
if [ "$#" -ne 1 ]; then
  echo "Usage (from skill root): scripts/build-demo.sh demo/<name>" >&2
  exit 1
fi

DEMO_ROOT="$(CDPATH= cd -- "$SKILL_ROOT/$1" && pwd)"
case "$(uname -m)" in
  arm64) ESBUILD="$SKILL_ROOT/starter/tools/esbuild-darwin-arm64" ;;
  x86_64) ESBUILD="$SKILL_ROOT/starter/tools/esbuild-darwin-x64" ;;
  *) echo "Unsupported macOS architecture: $(uname -m)" >&2; exit 1 ;;
esac

TMP="$DEMO_ROOT/.build-tmp"
cleanup() {
  rm -rf "$TMP"
}
trap cleanup EXIT HUP INT TERM

rm -rf "$TMP"
mkdir -p "$TMP"
"$ESBUILD" "$DEMO_ROOT/src/app.jsx" \
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
mkdir -p "$DEMO_ROOT/dist"
mv "$TMP/app.js" "$DEMO_ROOT/dist/app.js"
echo "Built $1/dist/app.js"
