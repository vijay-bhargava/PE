param (
    [string]$commitMessage
)

if (-not $commitMessage) {
    Write-Host "Error: No commit message provided."
    exit 1
}

# Run git commands without interaction

# Pull the latest changes (fetch and merge)
git fetch origin
git merge --no-edit origin/$(git rev-parse --abbrev-ref HEAD)

# Stage all changes
git add .

# Commit with the provided message
git commit -m $commitMessage

# Push the changes
git push
