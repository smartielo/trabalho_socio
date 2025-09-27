# push-watcher.ps1
# Script simples para observar alterações em um repositório local e fazer commit+push automático com debounce.
# Uso: execute no diretório raiz do repositório (onde está a pasta .git)

param(
    [string]$Path = ".",
    [int]$DebounceSeconds = 10,
    [string]$CommitMessage = "Auto commit: alterações locais",
    [string]$Branch = "main"
)

Write-Host "Iniciando watcher em: $Path"
Set-Location $Path

# Verifica se é um repo git
if (-not (Test-Path .git)) {
    Write-Host "Erro: este diretório não parece ser um repositório git (.git não encontrado)." -ForegroundColor Red
    exit 1
}

$timer = $null
$changed = $false

$fsw = New-Object System.IO.FileSystemWatcher $Path -Property @{ IncludeSubdirectories = $true; NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, DirectoryName' }

$onChange = {
    $global:changed = $true
    if ($timer) { $timer.Stop() }
    $timer = New-Object System.Timers.Timer ($DebounceSeconds * 1000)
    $timer.AutoReset = $false
    $timer.Add_Elapsed({
        if ($global:changed) {
            Try {
                Write-Host "Alterações detectadas. Fazendo commit e push..."
                git add -A
                git commit -m $CommitMessage | Out-Null
                git push origin $Branch
                Write-Host "Push concluído para origin/$Branch"
            } Catch {
                Write-Host "Erro durante git: $_" -ForegroundColor Yellow
            }
            $global:changed = $false
        }
    })
    $timer.Start()
}

$fsw.Created += $onChange
$fsw.Changed += $onChange
$fsw.Renamed += $onChange
$fsw.Deleted += $onChange

Write-Host "Watcher ativo. Debounce: $DebounceSeconds segundos. Pressione Ctrl+C para sair."

# Mantém script em execução
try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    $fsw.Dispose()
    if ($timer) { $timer.Dispose() }
}
