# Secret Santa Assignment Generator (Python) - Secure Christmas Passphrases

This directory contains a Python script for generating encrypted Secret Santa assignment files with **individual Christmas-themed passphrases** for maximum privacy. Each participant gets their own unique Christmas passphrase that only unlocks their specific assignment.

## Overview

The `generate_assignments.py` script creates a privacy-focused Secret Santa system where:
- Each participant gets a unique Christmas-themed passphrase
- Passphrases only unlock that person's assignment
- Even organizers cannot see assignments without individual passphrases
- No participant can access other participants' assignments
- Word bank is kept private to prevent dictionary attacks

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

# Custom output locations
python scripts/generate_assignments.py my-participants.csv \
  --output custom/data.enc \
  --passphrase-file custom/passphrases.csv

# Show assignments for verification (organizer eyes only!)
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
  CSV_FILE                      CSV file path (default: example-participants.csv)

Options:
  -o, --output PATH             Output file for encrypted data (default: public/secret-santa-data.enc)
  -p, --passphrase-file PATH    Output file for passphrases (default: secret-santa-passphrases.csv)
  --show-assignments            Print assignments to console (ORGANIZER ONLY - reveals who has whom)
  -h, --help                   Show help message
```

## What the Script Does

1. **Parses CSV** and validates participant data
2. **Generates assignments** avoiding conflicts:
   - No self-assignments
   - No significant other pairings
   - Uses intelligent retry logic (up to 1000 attempts)
3. **Creates unique passphrases** for each participant using Christmas-themed words
4. **Encrypts each assignment individually** with that person's passphrase
5. **Outputs two files**:
   - Encrypted assignments file (commit to repo)
   - Passphrase distribution file (distribute then DELETE)

## Sample Output

```
🎅 Secret Santa Assignment Generator (Individual Passphrases)
============================================================
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

🔑 Generating individual passphrases...
✅ Generated 5 unique passphrases

🔒 Creating encrypted assignment file: public/secret-santa-data.enc
📋 Creating passphrase distribution file: secret-santa-passphrases.csv

============================================================
🎄 SUCCESS! Secret Santa files generated
============================================================
📁 Encrypted assignments: public/secret-santa-data.enc
📋 Passphrase distribution: secret-santa-passphrases.csv
👥 Participants: 5
🔑 Individual passphrases: 5

📋 Next steps:
  1. Commit and push the encrypted file to your repo
  2. Distribute individual passphrases (send each person ONLY their own)
  3. Participants visit the website and enter their passphrase
  4. Each person will only see their own assignment

🔐 Security Notes:
  - Each participant has a unique passphrase
  - Passphrases only unlock that person's assignment
  - You (organizer) cannot see assignments without passphrases
  - Assignments are individually encrypted for maximum privacy
```

## Generated Files

### 1. Encrypted Assignments (`public/secret-santa-data.enc`)
- Contains individually encrypted assignments
- Safe to commit to your repository
- Uses hashed passphrase keys (no identifying information)
- Compatible with the React app

### 2. Passphrase Distribution (`secret-santa-passphrases.csv`)
- Contains names and their unique passphrases
- **DO NOT COMMIT** - for distribution only
- Delete after sending passphrases to participants
- Format: `Name,Passphrase`

Example passphrase file:
```csv
Name,Passphrase
Alice Johnson,eggnog-cane-gift-5270
Bob Johnson,scarf-blizzard-garland-6452
Charlie Smith,reindeer-frost-peppermint-8402
Diana Rodriguez,winter-holly-wreath-6483
Emily Chen,ice-snowflake-snowflake-4973
```

## Deployment Workflow

1. **Prepare your CSV** with participant data
2. **Run the script** to generate encrypted assignments and passphrases
3. **Commit only the encrypted file** (never commit passphrases)
4. **Distribute passphrases individually** to participants
5. **Delete the passphrases file** for security

```bash
# Complete workflow example
python scripts/generate_assignments.py my-participants.csv

# Deploy encrypted data only
git add public/secret-santa-data.enc
git commit -m "Update Secret Santa assignments for 2024"
git push origin main

# Distribute passphrases individually
# Send each person their row from secret-santa-passphrases.csv
# Example: "Hi Alice! Your Secret Santa passphrase: eggnog-cane-gift-5270"

# Security cleanup
rm secret-santa-passphrases.csv
```

## Technical Details

### Individual Encryption Architecture

Each assignment is encrypted separately:
- **Unique passphrase** per participant (3 words + 4-digit number)
- **Separate encryption** for each assignment using AES-GCM
- **Hashed lookup keys** using SHA-256 (removes identifying information)
- **No cross-access** - participants cannot decrypt other assignments

### File Format (v2.0)

The encrypted assignments file uses this structure:

```json
{
  "assignments": {
    "sha256_hash_of_passphrase_1": "encrypted_assignment_1",
    "sha256_hash_of_passphrase_2": "encrypted_assignment_2",
    "sha256_hash_of_passphrase_3": "encrypted_assignment_3"
  },
  "timestamp": 1640995200000,
  "version": "2.0"
}
```

### Encryption Compatibility

The Python script generates encryption that is **fully compatible** with the Web Crypto API:

- **Algorithm**: AES-GCM 256-bit
- **Key Derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **IV**: 12 bytes (GCM standard)
- **Salt**: 16 bytes
- **Format**: `salt + iv + ciphertext + tag` encoded as base64

### Assignment Algorithm

- **Conflict Detection**: Prevents self-assignment and SO pairing
- **Retry Logic**: Up to 1000 attempts to find valid arrangement
- **Random Shuffling**: Uses Python's `random.shuffle()` for fair distribution
- **Unique Passphrases**: Ensures no duplicate passphrases generated

## Security Model

### Privacy Guarantees
- **Participants**: Can only decrypt and view their own assignment
- **Organizers**: Cannot see assignments without individual passphrases
- **Cross-Participant Security**: No way to access other participants' assignments
- **Zero Knowledge**: Encrypted file contains no identifying information
- **Hidden Word Bank**: Christmas word list kept private (not in repository)

### Passphrase Security
- **Individual Generation**: Each person gets a unique Christmas-themed passphrase
- **Private Word Bank**: Holiday words loaded from private/christmas_words.txt (not committed)
- **Memorability**: Christmas theme makes passphrases easy to remember and type
- **Hidden Generation**: Word bank concealed from public repository viewers
- **Cryptographic Security**: Uses secrets module for secure word selection
- **No Collision**: Script ensures all passphrases are unique

## Troubleshooting

### Common Errors

**"cryptography package not found"**
```bash
# Make sure virtual environment is activated
source venv/bin/activate
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

**"Could not generate unique passphrase"**
- Very rare - indicates too many participants for the word list
- Script will retry automatically

### Debugging Tips

1. **Use `--show-assignments`** to see the generated pairings (organizer only!)
2. **Check CSV parsing** - the script shows each parsed participant
3. **Verify file permissions** for output directories
4. **Test with example CSV** first to confirm setup
5. **Check passphrase uniqueness** in the distribution file

## Security Best Practices

### For Organizers
- **Never commit** the passphrases file to your repository
- **Distribute individually** - send each person only their passphrase
- **Delete passphrases file** immediately after distribution
- **Use secure channels** (email, text, in person) to share passphrases
- **Don't peek** - resist the temptation to use `--show-assignments` unless debugging

### For Participants
- **Keep passphrase private** - don't share with other participants
- **Enter carefully** - passphrases are case-sensitive
- **Don't guess others'** - the system prevents cross-access anyway

## Legacy Support

The script generates v2.0 format files, but the React app also supports v1.0 (legacy single passphrase) for backward compatibility.

### Version Differences
- **v2.0 (Current)**: Individual passphrases, maximum privacy
- **v1.0 (Legacy)**: Single shared passphrase, name lookup required

## Dependencies

The script requires one external package:

```
cryptography>=41.0.0
```

This provides the AES-GCM encryption implementation compatible with Web Crypto API standards.

## Example: Complete Setup

```bash
# 1. Setup environment
python3 -m venv venv
source venv/bin/activate
pip install cryptography

# 2. Create participant list
cat > christmas-2024.csv << EOF
NAME,BIO,SO
Alice Johnson,"Coffee lover, reads fantasy novels",Bob Johnson
Bob Johnson,"Gamer, tech enthusiast",Alice Johnson
Charlie Smith,"Yoga instructor, plant parent",
Diana Rodriguez,"Photographer, loves to travel",
Emily Chen,"Baker, food blogger",
EOF

# 3. Generate assignments
python scripts/generate_assignments.py christmas-2024.csv

# 4. Check generated files
ls -la public/secret-santa-data.enc secret-santa-passphrases.csv

# 5. Deploy encrypted data
git add public/secret-santa-data.enc
git commit -m "Add Christmas 2024 Secret Santa assignments"
git push origin main

# 6. Distribute passphrases individually
# Open secret-santa-passphrases.csv and send each person their passphrase

# 7. Security cleanup
rm secret-santa-passphrases.csv christmas-2024.csv
```

The secure Christmas passphrase system ensures maximum privacy while being memorable - even you as the organizer won't know who has whom after distribution, and the private word bank keeps the generation method secure!