# Load .env variables
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#].+)=(.+)$') {
            $env:$($matches[1]) = $matches[2]
        }
    }
} else {
    Write-Error "Error: .env file not found"
    exit 1
}

# Create cache directory if it doesn't exist
$cacheDir = "cache"
New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null

Write-Host "Warming up cache..."

# Function to make authenticated request and save to cache
function Get-MangaData {
    param (
        [string]$endpoint,
        [string]$cacheFile
    )

    Write-Host "Fetching $endpoint data..."
    
    # First, authenticate
    $loginBody = @{
        username = $env:MANGA_USERNAME
        password = $env:MANGA_PASSWORD
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$env:NEXT_PUBLIC_API_URL/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = ($loginResponse.Content | ConvertFrom-Json).token

    # Then fetch data with token
    $headers = @{
        "Authorization" = "Bearer $token"
    }

    $response = Invoke-WebRequest -Uri "$env:NEXT_PUBLIC_API_URL/$endpoint" -Method GET -Headers $headers
    
    # Save to cache file
    $response.Content | Out-File -FilePath "$cacheDir/$cacheFile"
    
    Write-Host "$endpoint data: $($response.StatusCode)"
    return $response.Content
}

# Warm up latest manga cache
$latestData = Get-MangaData -endpoint "latest" -cacheFile "latest.json"

# Warm up popular manga cache
$popularData = Get-MangaData -endpoint "popular" -cacheFile "popular.json"

Write-Host "Cache warming complete!" 