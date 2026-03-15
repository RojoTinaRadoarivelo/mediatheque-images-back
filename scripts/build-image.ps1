$ErrorActionPreference = "Stop"

# ---- Config ----
$Registry = "ghcr.io"
$Owner = "<owner>"
$Image = "<image>"
$Tag = "<tag>"
$DeployHook = "<render_deploy_hook_url>"  # optional

# ---- Build ----
$FullImage = "$Registry/$Owner/$Image:$Tag"
docker build -f Dockerfile.image -t $FullImage .

# ---- Push ----
docker push $FullImage

# ---- Optional: trigger Render deploy hook ----
if ($DeployHook -and $DeployHook -ne "<render_deploy_hook_url>") {
  $EncodedImage = [System.Uri]::EscapeDataString($FullImage)
  $HookUrl = "$DeployHook?imgURL=$EncodedImage"
  Invoke-WebRequest -Uri $HookUrl -Method Post | Out-Null
}
