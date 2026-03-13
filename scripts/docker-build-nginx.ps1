$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$imageName = "ghcr.io/jotave07/vexor_api_winthor_nginx:latest"

Write-Host "Construindo imagem Docker do Nginx: $imageName"
docker build -f (Join-Path $projectRoot "nginx\\Dockerfile") -t $imageName (Join-Path $projectRoot "nginx")

Write-Host "Build do Nginx concluido com sucesso."
