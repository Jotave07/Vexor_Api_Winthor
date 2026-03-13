$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$instantClientPath = Join-Path $projectRoot "oracle\\instantclient"
$imageName = "ghcr.io/jotave07/vexor_api_winthor:latest"

Write-Host "Validando Oracle Instant Client para o build..."

$requiredFiles = @(
  "libclntsh.so.19.1",
  "libclntshcore.so.19.1",
  "libnnz19.so",
  "libocci.so.19.1",
  "libociei.so"
)

$missingFiles = @()

foreach ($file in $requiredFiles) {
  $found = Get-ChildItem -Path $instantClientPath -Recurse -File -Filter $file -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $found) {
    $missingFiles += $file
  }
}

if ($missingFiles.Count -gt 0) {
  Write-Error ("Arquivos do Instant Client Linux ausentes para o build: " + ($missingFiles -join ", "))
}

Write-Host "Construindo imagem Docker: $imageName"
docker build -t $imageName $projectRoot

Write-Host "Build concluido com sucesso."
