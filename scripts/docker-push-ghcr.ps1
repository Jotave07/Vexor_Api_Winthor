$ErrorActionPreference = "Stop"

$imageName = "ghcr.io/jotave07/vexor_api_winthor:latest"

Write-Host "Publicando imagem: $imageName"
docker push $imageName

Write-Host "Push concluido com sucesso."
