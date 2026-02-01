#!/bin/bash
set -e

# Install Python 3.10
apt-get update
apt-get install -y python3.10 python3.10-venv python3.10-dev

# Create venv with Python 3.10
python3.10 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
cd src/backend
pip install -r requirements.txt
