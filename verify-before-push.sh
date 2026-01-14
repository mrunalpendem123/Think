#!/bin/bash

echo "🔍 Security Check Before GitHub Push"
echo "======================================"
echo ""

# Check 1: .env.local is gitignored
echo "✓ Checking if .env.local is gitignored..."
if git status | grep -q "\.env\.local$"; then
    echo "❌ ERROR: .env.local is NOT gitignored!"
    exit 1
else
    echo "✅ .env.local is properly gitignored"
fi

# Check 2: No API keys in code
echo ""
echo "✓ Checking for exposed API keys in code..."
if git diff HEAD | grep -qE "5veQ8IP7eF|sawKl_nOFldN78HAQHFwxixaj90aySp4PTa6trRx"; then
    echo "❌ ERROR: API keys found in staged changes!"
    exit 1
else
    echo "✅ No API keys found in code"
fi

# Check 3: Show what will be committed
echo ""
echo "📦 Files to be committed:"
echo "------------------------"
git status --short

echo ""
echo "✅ Security check passed!"
echo ""
echo "Ready to push to GitHub? Run:"
echo "  git add ."
echo "  git commit -m 'Integrate Venice AI and Parallel AI for private search'"
echo "  git push origin main"
