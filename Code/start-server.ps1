# Simple PowerShell HTTP Server
param(
    [int]$Port = 8000,
    [string]$Path = "."
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "Server started at http://localhost:$Port" -ForegroundColor Green
Write-Host "Serving files from: $(Resolve-Path $Path)" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $requestedPath = $request.Url.LocalPath
        if ($requestedPath -eq "/") {
            $requestedPath = "/performance-test.html"
        }
        
        $filePath = Join-Path $Path $requestedPath.TrimStart('/')
        
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - $($request.HttpMethod) $requestedPath" -ForegroundColor Gray
        
        if (Test-Path $filePath -PathType Leaf) {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            
            # Set content type based on file extension
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($extension) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css" { $response.ContentType = "text/css; charset=utf-8" }
                ".js" { $response.ContentType = "application/javascript; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".png" { $response.ContentType = "image/png" }
                ".jpg" { $response.ContentType = "image/jpeg" }
                ".gif" { $response.ContentType = "image/gif" }
                ".svg" { $response.ContentType = "image/svg+xml; charset=utf-8" }
                default { $response.ContentType = "text/plain; charset=utf-8" }
            }
            
            $response.ContentLength64 = $buffer.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $errorMessage = "File not found: $requestedPath"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorMessage)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Server error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    $listener.Stop()
    Write-Host "Server stopped" -ForegroundColor Red
}