#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip
pip install --upgrade pip

# Install python dependencies
pip install -r requirements.txt

# Run migrations if using alembic
# alembic upgrade head

# Run seeding script if needed
# python seed_db.py
