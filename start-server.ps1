param(
  [int]$Port = 8765,
  [switch]$NoBrowser,
  [switch]$Lan
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BindAddr = if ($Lan) { [System.Net.IPAddress]::Any } else { [System.Net.IPAddress]::Loopback }
$Listener = [System.Net.Sockets.TcpListener]::new($BindAddr, $Port)
$Listener.Start()
$Url = "http://127.0.0.1:$Port/"

Write-Host "ahaboard AI 白板家教已啟動於 $Url (按 Ctrl+C 停止)" -ForegroundColor Green
if ($Lan) {
  $LanIPs = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
    Select-Object -ExpandProperty IPAddress
  foreach ($ip in $LanIPs) {
    Write-Host "手機同 Wi-Fi 連線網址: http://$($ip):$Port/" -ForegroundColor Cyan
  }
}
if (-not $NoBrowser) {
  Start-Process $Url
}

$MimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".svg"  = "image/svg+xml"
}

try {
  while ($true) {
    $Client = $Listener.AcceptTcpClient()
    try {
      $Stream = $Client.GetStream()
      $Reader = New-Object System.IO.StreamReader($Stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $RequestLine = $Reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($RequestLine)) { $Client.Close(); continue }
      while (($Line = $Reader.ReadLine()) -ne $null -and $Line -ne "") {}

      $Parts = $RequestLine.Split(' ')
      $RawPath = if ($Parts.Length -ge 2) { $Parts[1].Split('?')[0] } else { "/" }
      $RelPath = [System.Uri]::UnescapeDataString($RawPath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($RelPath)) { $RelPath = "index.html" }

      $FullPath = [System.IO.Path]::GetFullPath((Join-Path $Root $RelPath))
      if ($FullPath.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path $FullPath -PathType Leaf)) {
        $Ext = [System.IO.Path]::GetExtension($FullPath).ToLowerInvariant()
        $Mime = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { "application/octet-stream" }
        $Body = [System.IO.File]::ReadAllBytes($FullPath)
        $Header = "HTTP/1.1 200 OK`r`nContent-Type: $Mime`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
        $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
        $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
        $Stream.Write($Body, 0, $Body.Length)
      } else {
        $NotFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $Header = "HTTP/1.1 404 Not Found`r`nContent-Length: $($NotFound.Length)`r`nConnection: close`r`n`r`n"
        $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
        $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
        $Stream.Write($NotFound, 0, $NotFound.Length)
      }
      $Stream.Flush()
    } finally {
      $Client.Close()
    }
  }
} finally {
  $Listener.Stop()
}
