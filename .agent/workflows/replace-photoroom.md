---
description: Replace *-Photoroom.png images with the standard filename
---

1. Execute the replacement script
// turbo
Get-ChildItem -Path . -Recurse -Filter "*-Photoroom.png" | ForEach-Object {
    $newName = $_.Name -replace '-Photoroom',''
    Move-Item -Path $_.FullName -Destination (Join-Path $_.Directory $newName) -Force
    Write-Host "Renamed $($_.Name) to $newName"
}
