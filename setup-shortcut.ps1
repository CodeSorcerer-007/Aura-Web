$targetDir = $PSScriptRoot
if (-not $targetDir) {
    $targetDir = (Get-Location).Path
}

$wsh = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "Aura.lnk"

$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$targetDir\launch-aura.vbs`""
$shortcut.WorkingDirectory = $targetDir
$shortcut.Description = "Aura - 100% Offline Mindful Productivity App"
$shortcut.Save()

Write-Host "Desktop shortcut created successfully at: $shortcutPath" -ForegroundColor Green
