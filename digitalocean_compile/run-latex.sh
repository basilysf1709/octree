#!/bin/bash

# Exit on any error
set -e

# Create temp directory with unique name
TEMP_DIR=$(mktemp -d /tmp/latex-compile-XXXXXX)
cd "$TEMP_DIR"

# Function to cleanup on exit
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Write input to file
cat > main.tex

# Check if file was written
if [ ! -s main.tex ]; then
    echo "Error: No content received" >&2
    exit 1
fi

# Run pdflatex with optimizations
# -interaction=nonstopmode: Continue on errors
# -output-directory: Put output in temp dir
# -halt-on-error: Stop on first error (but we use nonstopmode)
pdflatex -interaction=nonstopmode -output-directory="$TEMP_DIR" main.tex > /dev/null 2>&1

# Check if PDF was created
if [ -f main.pdf ]; then
    # Output PDF to stdout
    cat main.pdf
    exit 0
else
    echo "Error: PDF not generated" >&2
    # Output log file for debugging
    if [ -f main.log ]; then
        cat main.log >&2
    fi
    exit 1
fi 