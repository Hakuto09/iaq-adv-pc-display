# PowerShellスクリプト
$branchList = @(
    "main"
)

if (($args.Count -ne 2) -and ($args.Count -ne 3)) {
###    Write-Host "Usage: .\script.ps1 <branch> <version> <commit comment> <options>"
    Write-Host "Usage: .\script.ps1 <branch> <commit comment> <options>"
###    Write-Host "Example: .\script.ps1 main V1.0.0 20250311r01-001_build-test"
    Write-Host "Example: .\script.ps1 main 20250311r01-001_build-test"
    Write-Host "Branch list:"
    foreach ($item in $branchList) {
        Write-Host $item
    }
    exit 1
}

$branch = $args[0]
###$version = $args[1]
$comments = $args[1]
$options = $args[2]
$found = $false

#### version.jsを削除
###Remove-Item -Path "version.js" -ErrorAction Ignore

# ブランチがリストにあるかどうか確認
foreach ($item in $branchList) {
    if ($item -eq $branch) {
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host "'$branch' is not exist as userBranch!!"
    exit
}

#### version.jsファイルにバージョン情報を出力する
###"export const version = '$version';" | Out-File -FilePath "version.js" -Encoding UTF8
# バージョンをログ出力する (に変更)
Select-String -Path ./version.js -Pattern "APP_VERSION"

# Git操作
git add .
git commit -m $comments
git push origin $branch $options

#### DUMMYバージョンを書き戻す
###"export const version = 'DUMMY';" | Out-File -FilePath "version.js" -Encoding UTF8
