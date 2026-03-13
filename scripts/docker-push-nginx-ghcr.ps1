$ErrorActionPreference = "Stop"

$imageName = "ghcr.io/jotave07/vexor_api_winthor_nginx:latest"

Write-Host "Publicando imagem: $imageName"
docker push $imageName

Write-Host "Push do Nginx concluido com sucesso."
