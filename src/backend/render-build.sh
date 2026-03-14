#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install python dependencies
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# Run seeding script if needed
# echo "Seeding database..."
# python seed_db.py

echo "Build complete! ✅"
