# Tiny static web server for previewing the site (needs nothing installed - uses Windows PowerShell).
# YouTube only plays embedded videos on pages served over http, so use this instead of double-clicking index.html.
$ErrorActionPreference = 'Continue'
$root = (Split-Path -Parent $MyInvocation.MyCommand.Path).TrimEnd('\')

$mime = @{
  '.html'='text/html; charset=utf-8'; '.htm'='text/html; charset=utf-8'
  '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8'
  '.json'='application/json'; '.svg'='image/svg+xml'; '.png'='image/png'
  '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.gif'='image/gif'
  '.ico'='image/x-icon'; '.woff'='font/woff'; '.woff2'='font/woff2'; '.txt'='text/plain; charset=utf-8'
  '.mp4'='video/mp4'; '.webm'='video/webm'
}

$listener = $null
$port = 0
foreach ($p in 8000..8010) {
  $l = New-Object System.Net.HttpListener
  $l.Prefixes.Add("http://localhost:$p/")
  try {
    $l.Start()
    $listener = $l
    $port = $p
    break
  } catch {
    $l.Close()
  }
}
if ($listener -eq $null) {
  Write-Host 'Could not start the server (ports 8000-8010 are busy).'
  exit 1
}

$url = "http://localhost:$port/"
Write-Host ''
Write-Host "  Mr. Yoda site is running at  $url"
Write-Host '  Keep this window open while previewing. Close it (or press Ctrl+C) to stop.'
Write-Host ''
Start-Process $url

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($rel -eq '/') { $rel = '/index.html' }
    $full = [IO.Path]::GetFullPath((Join-Path $root ($rel.TrimStart('/').Replace('/', '\'))))
    if ((-not $full.StartsWith($root)) -or (-not (Test-Path -LiteralPath $full -PathType Leaf))) {
      $ctx.Response.StatusCode = 404
      $msg = [Text.Encoding]::UTF8.GetBytes('404 Not found')
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    } else {
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $type = $mime[$ext]
      if (-not $type) { $type = 'application/octet-stream' }
      $bytes = [IO.File]::ReadAllBytes($full)
      $ctx.Response.ContentType = $type
      $ctx.Response.Headers.Add('Cache-Control', 'no-cache')
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
  } catch {
    # a browser cancelled a request - ignore and keep serving
  } finally {
    try { $ctx.Response.Close() } catch {}
  }
}
