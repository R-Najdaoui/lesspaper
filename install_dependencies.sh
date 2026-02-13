#!/bin/bash

echo "Installing CustomTkinter for LessPaper..."

# Try different installation methods
if command -v pip3 &> /dev/null; then
    echo "Installing with pip3..."
    pip3 install customtkinter
elif command -v pip &> /dev/null; then
    echo "Installing with pip..."
    pip install customtkinter
elif command -v pipx &> /dev/null; then
    echo "Installing with pipx..."
    pipx install customtkinter
else
    echo "Error: No Python package manager found (pip, pip3, or pipx)"
    echo "Please install CustomTkinter manually:"
    echo "  pip install customtkinter"
    echo "  or"
    echo "  pip3 install customtkinter"
    exit 1
fi

echo "Installation complete! You can now run the LessPaper application."


