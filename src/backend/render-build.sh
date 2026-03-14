#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip and build tools
echo "Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel

# Install python dependencies - use --prefer-binary to avoid building from source
echo "Installing dependencies from requirements.txt..."
pip install --prefer-binary -r requirements.txt

echo "Build complete! ✅"
