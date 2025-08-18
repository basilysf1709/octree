#!/bin/bash

# Set error handling
set -e

# Set working directory
cd /data

# Create a temporary file for the TeX content
TEMP_TEX="/tmp/input_$$.tex"
trap "rm -f $TEMP_TEX" EXIT

# Read input from stdin and write to temp file
cat > "$TEMP_TEX"

# Check if input is empty
if [ ! -s "$TEMP_TEX" ]; then
    echo "Error: Empty input received" >&2
    exit 1
fi

echo "Input received, length: $(wc -c < "$TEMP_TEX") bytes" >&2

# Run pdflatex with proper error handling
echo "Starting pdflatex compilation..." >&2

# Use timeout to prevent hanging processes
timeout 25s pdflatex \
    -interaction=nonstopmode \
    -output-directory=/data \
    -file-line-error \
    -halt-on-error \
    "$TEMP_TEX" >&2

# Check exit code
EXIT_CODE=$?

echo "pdflatex exited with code: $EXIT_CODE" >&2

# Check if PDF was created
if [ -f "main.pdf" ]; then
    echo "PDF created successfully" >&2
    echo "PDF size: $(wc -c < main.pdf) bytes" >&2
    
    # Verify PDF is valid (check first few bytes)
    FIRST_BYTES=$(head -c 4 main.pdf | xxd -p)
    if [ "$FIRST_BYTES" = "25504446" ]; then
        echo "PDF validation passed" >&2
        exit 0
    else
        echo "PDF validation failed, first bytes: $FIRST_BYTES" >&2
        exit 1
    fi
else
    echo "PDF not created" >&2
    
    # Check for log file
    if [ -f "main.log" ]; then
        echo "LaTeX log content:" >&2
        head -50 main.log >&2
    fi
    
    exit 1
fi 