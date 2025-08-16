# Secret Santa Assignment Generator (Python)

This directory contains a Python script for generating encrypted Secret Santa assignment files that are compatible with the React app.

## Overview

The `generate_assignments.py` script replaces the problematic Web Crypto API functionality with a robust Python-based solution. It reads a CSV file with participant data, generates Secret Santa assignments, encrypts the data using AES-GCM, and outputs an encrypted file that the React app can automatically load.

## Quick Start

### Prerequisites

- Python 3.7+
- Virtual environment (recommended)

### Setup

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Mac/Linux
# venv\Scripts\activate   # On Windows

# Install dependencies
pip install cryptography
```

### Basic Usage

```bash
# Generate assignments using example CSV
python scripts/generate_assignments.py

# Use your own CSV file
python scripts/generate_assignments.py my-participants.csv

# Custom output location
python scripts/generate_assignments.py --output data/encrypted.enc

# Use custom passphrase
python scripts/generate_assignments.py --passphrase "my-secret-phrase"

# Show assignments for verification
python scripts/generate_assignments.py --show-assignments
```

## CSV Format

Your CSV file must have these columns:

- **NAME** (required): Full participant name
- **BIO** (optional): Gift preferences and interests
- **SO** (optional): Significant Other name (prevents pairing)

### Example CSV

```csv
NAME,BIO,SO
Alice Johnson,"Loves coffee and books. Gift ideas: coffee beans, novels, cozy blankets",Bob Johnson
Bob Johnson,"Tech enthusiast and gamer. Gift ideas: gadgets, games, tech books",Alice Johnson
Charlie Smith,"Yoga instructor and plant lover. Gift ideas: yoga gear, plants, meditation books",
Diana Rodriguez,"Artist and photographer. Gift ideas: art supplies, camera gear, travel guides",
Emily Chen,"Baker and food blogger. Gift ideas: baking tools, cookbooks, spices",
```

### Important Notes

- **Quoted fields**: Use quotes around BIO if it contains commas
- **Case insensitive**: Column headers are case insensitive
- **Empty SO**: Leave SO field empty if no significant other
- **Minimum participants**: Need at least 2 people

## Command Line Options

```bash
python scripts/generate_assignments.py [CSV_FILE] [OPTIONS]

Arguments:
  CSV_FILE                 CSV file path (default: example-participants.csv)

Options:
  -o, --output PATH        Output file path (default: public/secret-santa-data.enc)
  -p, --passphrase TEXT    Custom passphrase (auto-generated if not provided)
  --show-assignments       Print assignments to console for verification
  -h, --help              Show help message
```

## What the Script Does

1. **Parses CSV** and validates participant data
2. **Generates assignments** avoiding conflicts:
   - No self-assignments
   - No significant other pairings
   - Uses intelligent retry logic (up to 1000 attempts)
3. **Creates passphrase** using Christmas-themed words + numbers
4. **Encrypts data** using AES-GCM with PBKDF2 key derivation
5. **Outputs file** compatible with the React app format

## Sample Output

```
🎅 Secret Santa Assignment Generator
========================================
📄 Parsing CSV: example-participants.csv
Parsed: Alice Johnson (SO: Bob Johnson)
Parsed: Bob Johnson (SO: Alice Johnson)
Parsed: Charlie Smith (SO: None)
Parsed: Diana Rodriguez (SO: None)
Parsed: Emily Chen (SO: None)
✅ Loaded 5 participants

🎲 Generating assignments...
Generated valid assignments on attempt 3
✅ Generated 5 assignments

🔑 Generated passphrase: snowflake-mistletoe-gift-star-742

🔒 Encrypting assignments...
✅ Encryption complete

💾 Creating encrypted file: public/secret-santa-data.enc
Encrypted file created: public/secret-santa-data.enc

==================================================
🎄 SUCCESS! Secret Santa file generated
==================================================
📁 File: public/secret-santa-data.enc
🔑 Passphrase: snowflake-mistletoe-gift-star-742
👥 Participants: 5
📝 Assignments: 5

📋 Next steps:
  1. Commit and push the encrypted file to your repo
  2. Share the passphrase with participants
  3. Participants can look up their assignments on the website
  4. Keep this passphrase safe: snowflake-mistletoe-gift-star-742

💡 Tip: The app will automatically load the encrypted file from GitHub Pages
```

## Deployment Workflow

1. **Prepare your CSV** with participant data
2. **Run the script** to generate encrypted assignments
3. **Commit and push** the `public/secret-santa-data.enc` file
4. **Share the passphrase** with participants
5. **Deploy** - GitHub Pages will automatically serve the new file

```bash
# Complete workflow example
python scripts/generate_assignments.py my-participants.csv
git add public/secret-santa-data.enc
git commit -m "Update Secret Santa assignments for 2024"
git push origin main
```

## Technical Details

### Encryption Compatibility

The Python script generates encryption that is **fully compatible** with the Web Crypto API format:

- **Algorithm**: AES-GCM 256-bit
- **Key Derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **IV**: 12 bytes (GCM standard)
- **Salt**: 16 bytes
- **Format**: `salt + iv + ciphertext + tag` encoded as base64

### File Format

The output file matches the React app's expected format:

```json
{
  "data": "base64_encrypted_assignments",
  "timestamp": 1640995200000,
  "version": "1.0"
}
```

### Assignment Algorithm

- **Conflict Detection**: Prevents self-assignment and SO pairing
- **Retry Logic**: Up to 1000 attempts to find valid arrangement
- **Random Shuffling**: Uses Python's `random.shuffle()` for fair distribution

## Troubleshooting

### Common Errors

**"cryptography package not found"**
```bash
pip install cryptography
```

**"CSV file not found"**
- Check file path relative to where you're running the script
- Ensure file exists and is readable

**"Missing required columns"**
- CSV must have NAME, BIO, SO columns (case insensitive)
- Check your header row

**"Could not generate valid assignments"**
- Too many SO constraints for the group size
- Try adding more participants or reducing SO pairs

**"Line X has insufficient columns"**
- Ensure all rows have the same number of columns
- Use quotes around fields containing commas

### Debugging Tips

1. **Use `--show-assignments`** to see the generated pairings
2. **Check CSV parsing** - the script shows each parsed participant
3. **Verify file permissions** for output directory
4. **Test with example CSV** first to confirm setup

## Security Notes

- **Passphrase**: Auto-generated using secure random selection
- **Encryption**: Industry-standard AES-GCM with proper key derivation
- **Privacy**: Organizer cannot see actual assignments, only encrypted data
- **No Network**: All operations are local - no data sent anywhere

## Dependencies

The script only requires one external package:

```
cryptography>=41.0.0
```

This provides the AES-GCM encryption implementation compatible with Web Crypto API standards.