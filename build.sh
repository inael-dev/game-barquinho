#!/bin/sh
# index.html = game.html (the claude.ai artifact fragment) wrapped in a full document,
# plus what only the Vercel site has: PWA manifest, icons and service worker
cd "$(dirname "$0")"
{
  cat <<'HEAD'
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Desça o rio no barquinho de papel: pule ondas e pedras, abaixe das gaivotas e entre no ranking.">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#10221f">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<link rel="apple-touch-icon" href="/icons/icon-180.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Barquinho">
<style>html { padding-top: env(safe-area-inset-top, 0px); }</style>
<script>if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));</script>
</head>
<body>
HEAD
  cat game.html
  printf '\n</body>\n</html>\n'
} > index.html
