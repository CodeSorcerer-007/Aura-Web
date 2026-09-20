$targetDir = $PSScriptRoot
if (-not $targetDir) {
    $targetDir = (Get-Location).Path
}

$wsh = New-Object -ComObject WScript.Shell
$iconFile = Join-Path $targetDir "public\favicon.ico"

# Target directories for shortcuts:
$targetFolders = @()

# 1. Primary Desktop (e.g. OneDrive Desktop or local Desktop)
$desktop = [Environment]::GetFolderPath('Desktop')
if ($desktop -and (Test-Path $desktop)) {
    $targetFolders += $desktop
}

# 2. Local user profile Desktop (if different)
$userDesktop = Join-Path $env:USERPROFILE "Desktop"
if ($userDesktop -and (Test-Path $userDesktop) -and ($targetFolders -notcontains $userDesktop)) {
    $targetFolders += $userDesktop
}

# 3. Windows Start Menu Programs
$programs = [Environment]::GetFolderPath('Programs')
if ($programs -and (Test-Path $programs)) {
    $targetFolders += $programs
}

foreach ($folder in $targetFolders) {
    $shortcutPath = Join-Path $folder "Aura.lnk"
    $shortcut = $wsh.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "wscript.exe"
    $shortcut.Arguments = "`"$targetDir\launch-aura.vbs`""
    $shortcut.WorkingDirectory = $targetDir
    $shortcut.Description = "Aura - 100% Offline Mindful Productivity App"
    if (Test-Path $iconFile) {
        $shortcut.IconLocation = "$iconFile,0"
    }
    $shortcut.Save()
    Write-Host "Created shortcut: $shortcutPath" -ForegroundColor Green
}
