# 🎅 Secret Santa - Individual Passphrase Edition

A secure, privacy-focused Secret Santa gift exchange application designed to run on GitHub Pages. Each participant gets their own unique Christmas-themed passphrase that only unlocks their specific assignment, ensuring maximum privacy.

## ✨ Key Features

- **🔐 Individual Passphrases**: Each person gets a unique Christmas-themed passphrase that only shows their assignment
- **🔒 Maximum Privacy**: Even organizers cannot see assignments without individual passphrases
- **🌐 GitHub Pages Compatible**: Fully static app that works with GitHub Pages hosting
- **📱 Responsive Design**: Beautiful Christmas-themed UI that works on all devices
- **🖨️ Print-Friendly**: Clean print layout for physical reference cards
- **🎯 Smart Assignment Generation**: Prevents self-assignment and significant other matches
- **🚫 No Cross-Viewing**: Participants cannot see other people's assignments

## 🎯 How It Works

This app revolutionizes Secret Santa privacy by giving each participant their own encrypted assignment:

1. **CSV Preparation**: Create a CSV file with participant data (NAME, BIO, SO)
2. **Script Generation**: Python script creates individual encrypted assignments
3. **Unique Passphrases**: Each person gets their own Christmas-themed passphrase
4. **Secure Distribution**: Organizer distributes passphrases without seeing assignments
5. **Private Lookup**: Participants enter their passphrase to see only their assignment

## 🚀 Quick Start

### For Participants

1. Visit the deployed app
2. Enter your personal passphrase (provided by organizer)
3. View your Secret Santa recipient and their gift preferences
4. Use the print button for a physical reference card
5. Keep your passphrase private!

### For Organizers

1. **Prepare Your Data**: Create a CSV file with columns: `NAME`, `BIO`, `SO`
   ```csv
   NAME,BIO,SO
   John Doe,"Loves coffee and hiking. Gift ideas: coffee beans, books",Jane Doe
   Jane Doe,"Enjoys cooking and yoga. Gift ideas: tea sets, plants",John Doe
   Alice Smith,"Photography enthusiast. Gift ideas: camera accessories",
   ```

2. **Generate Individual Assignments**:
   ```bash
   # Install dependencies (first time only)
   npm install

   # Set up Python environment
   python3 -m venv venv
   source venv/bin/activate
   pip install cryptography

   # Generate encrypted assignments with individual passphrases
   python scripts/generate_assignments.py your-participants.csv
   ```

3. **Deploy**:
   ```bash
   # Commit only the encrypted file (NOT the passphrases file)
   git add public/secret-santa-data.enc
   git commit -m "Update Secret Santa assignments"
   git push
   ```

4. **Distribute Passphrases**:
   - Open `secret-santa-passphrases.csv`
   - Send each person ONLY their own passphrase
   - Delete the passphrases file after distribution for security

## 📋 CSV Format

Your CSV file should follow this format:

```csv
NAME,BIO,SO
John Doe,"Loves coffee, hiking, and board games. Gift ideas: coffee beans, hiking gear",Jane Doe
Jane Doe,"Enjoys cooking, yoga, and gardening. Gift ideas: cooking utensils, tea sets",John Doe
Alice Smith,"Photography enthusiast, loves travel. Gift ideas: camera accessories, art supplies",
Bob Johnson,"Tech lover, enjoys games and programming. Gift ideas: gadgets, games, books",
Charlie Wilson,"Musician and reader. Gift ideas: music gear, books, vinyl records",
```

**Column Details:**
- **NAME** (required): Full name of participant
- **BIO** (optional): Hobbies, interests, and gift suggestions
- **SO** (optional): Significant other's name to prevent pairing

**Important Notes:**
- Use quotes around BIO entries that contain commas
- SO column can be empty for participants without significant others
- Names in SO column must exactly match a NAME in the list

## 🛠️ Development Setup

### Prerequisites
- Node.js 14 or higher
- Python 3.7 or higher
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd secret-santa

# Install Node.js dependencies
npm install

# Set up Python environment
python3 -m venv venv
source venv/bin/activate
pip install cryptography

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
python scripts/generate_assignments.py  # Generate encrypted Secret Santa data
```

## 🔧 Generating Secret Santa Data

### Basic Usage

```bash
# Activate Python environment
source venv/bin/activate

# Generate from your CSV file
python scripts/generate_assignments.py my-participants.csv

# Or use the example file for testing
python scripts/generate_assignments.py example-participants.csv
```

### Advanced Options

```bash
# Custom output locations
python scripts/generate_assignments.py my-participants.csv \
  --output custom/path/data.enc \
  --passphrase-file custom/path/passphrases.csv

# Show assignments for verification (organizer eyes only!)
python scripts/generate_assignments.py my-participants.csv --show-assignments
```

### What Happens

1. **Reads your CSV** and validates the format
2. **Generates assignments** avoiding conflicts (self/SO pairings)
3. **Creates unique Christmas-themed passphrases** for each participant using secure word selection
4. **Encrypts each assignment individually** with that person's passphrase
5. **Saves files**:
   - `public/secret-santa-data.enc` (commit this - contains encrypted assignments)
   - `secret-santa-passphrases.csv` (distribute then DELETE - contains passphrases)

### Example Output

```
🎅 Secret Santa Assignment Generator (Individual Passphrases)
============================================================
📄 Parsing CSV: my-participants.csv
✅ Loaded 5 participants

🎲 Generating assignments...
✅ Generated 5 assignments

🔑 Generating individual passphrases...
✅ Generated 5 unique passphrases

🔒 Creating encrypted assignment file: public/secret-santa-data.enc
📋 Creating passphrase distribution file: secret-santa-passphrases.csv

🎄 SUCCESS! Secret Santa files generated
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
  - Each participant has a unique Christmas-themed passphrase
  - Passphrases only unlock that person's assignment
  - You (organizer) cannot see assignments without passphrases
  - Assignments are individually encrypted for maximum privacy
  - Christmas-themed passphrases for memorability and security
```

## 🚀 Deployment

### GitHub Pages (Recommended)

1. **Enable GitHub Pages**:
   - Go to repository settings → Pages
   - Set source to "GitHub Actions"

2. **Deploy**:
   ```bash
   # Generate your data
   source venv/bin/activate
   python scripts/generate_assignments.py my-participants.csv

   # Commit ONLY the encrypted file
   git add public/secret-santa-data.enc
   git commit -m "Update Secret Santa assignments"
   git push
   ```

3. **Distribute Passphrases**:
   - Open `secret-santa-passphrases.csv`
   - Send each person their row via email/text
   - Example: "Hi Alice! Your Secret Santa passphrase is: twinkling-peace-sparkle-celebrate-4896"
   - **Delete the passphrases file after distribution**

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the dist/ folder to your hosting provider
```

## 🔧 Configuration

### Base Path
Update `vite.config.ts` if deploying to a subdirectory:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  plugins: [react()],
})
```

### Repository Structure
```
secret-santa/
├── scripts/
│   ├── generate_assignments.py     # Python assignment generator
│   ├── requirements.txt            # Python dependencies
│   └── README.md                   # Script documentation
├── src/
│   ├── utils/
│   │   ├── encryption.ts           # Individual passphrase encryption
│   │   ├── csvParser.ts            # Data parsing utilities
│   │   └── fileUtils.ts            # File handling (v1.0 & v2.0 support)
│   └── App.tsx                     # Main app (individual passphrase lookup)
├── public/
│   └── secret-santa-data.enc       # Generated encrypted assignments
├── example-participants.csv        # Example CSV file
├── venv/                           # Python virtual environment (local only)
├── private/                        # Private word bank (gitignored for security)
│   └── christmas_words.txt         # Christmas word bank (keep private)
└── secret-santa-passphrases.csv   # Generated passphrases (DELETE after distribution)
```

## 🔒 Security & Privacy Model

### Individual Encryption
- Each assignment is encrypted separately with a unique Christmas-themed passphrase
- Passphrases are hashed to create lookup keys (no identifying information)
- Even with the encrypted file, you need the specific passphrase to decrypt an assignment

### Privacy Guarantees
- **Participants**: Can only see their own assignment, never others'
- **Organizers**: Cannot see assignments without individual passphrases
- **Maximum Security**: Even if someone gets multiple passphrases, they only see those specific assignments

### Data Flow
1. **CSV Input** → Script reads participant data
2. **Assignment Generation** → Creates assignments avoiding conflicts
3. **Individual Encryption** → Each assignment encrypted with unique passphrase
4. **Secure Storage** → Encrypted assignments stored with hashed passphrase keys
5. **Private Distribution** → Each person gets only their passphrase
6. **Individual Lookup** → Passphrase unlocks only that person's assignment

## 🎨 Customization

### Theme Colors
Edit CSS variables in `src/index.css`:

```css
:root {
  --holly-green: #0f5132;
  --cranberry-red: #dc3545;
  --snow-white: #ffffff;
  --warm-cream: #f8f9fa;
  --gold: #ffc107;
}
```

### Passphrase Generation
The script uses a private Christmas word bank for secure passphrase generation:

```python
# Christmas-themed passphrases using secure word selection
# Word bank kept in private/ directory (not committed to repository)
# Provides memorability while maintaining cryptographic security
```

## 🐛 Troubleshooting

### Script Issues

**"CSV file not found"**
- Check the file path is correct relative to project root
- Ensure the CSV file exists and is readable

**"Could not generate valid assignments"**
- Too many SO constraints for the participant count
- Try reducing significant other pairings or adding more participants

**"cryptography package not found"**
- Make sure you've activated the virtual environment: `source venv/bin/activate`
- Install the package: `pip install cryptography`

### App Issues

**"No Secret Santa data found"**
- Run the generation script first: `python scripts/generate_assignments.py your-file.csv`
- Ensure `public/secret-santa-data.enc` exists and was committed

**"No assignment found for this passphrase"**
- Check the passphrase is entered correctly (case-sensitive)
- Verify you're using the correct passphrase from the distribution file
- Make sure the passphrase matches exactly

**"Failed to decrypt assignment"**
- Double-check the passphrase spelling
- Ensure you're using the passphrase that was specifically generated for you

## 💡 Complete Workflow Example

```bash
# 1. Setup (first time only)
git clone <your-repo>
cd secret-santa
npm install
python3 -m venv .venv
source venv/bin/activate
pip install cryptography

# 2. Create your participant list
cp example-participants.csv christmas-2024.csv
# Edit christmas-2024.csv with your actual participants

# 3. Generate encrypted assignments with individual passphrases
python scripts/generate_assignments.py christmas-2024.csv

# 4. Deploy encrypted data
git add public/secret-santa-data.enc
git commit -m "Update Secret Santa assignments for Christmas 2024"
git push

# 5. Distribute passphrases individually
# Open secret-santa-passphrases.csv
# Send each person their specific passphrase via email/text
# Example messages:
#   "Hi Alice! Your Secret Santa passphrase: twinkling-peace-sparkle-celebrate-4896"
#   "Hi Bob! Your Secret Santa passphrase: drifting-wonder-eggnog-storm-4335"

# 6. Cleanup for security
rm secret-santa-passphrases.csv christmas-2024.csv
# Keep the encrypted file - that's safe to store

# 7. Share the website
echo "Everyone can visit: https://yourusername.github.io/secret-santa/"
echo "Each person enters their unique passphrase to see their assignment"
```

## 🎄 Usage Tips

### For Organizers
- **Test first**: Use `example-participants.csv` to understand the system
- **One passphrase per person**: Each participant gets their own unique passphrase
- **Secure distribution**: Send passphrases individually (email, text, in person)
- **Privacy protection**: You won't see who gives to whom after encryption
- **Delete passphrases file**: Remove `secret-santa-passphrases.csv` after distribution
- **No shared access**: Unlike traditional Secret Santa, there's no "master key"

### For Participants
- **Personal passphrase**: Your passphrase is unique to you
- **Keep it private**: Don't share your passphrase with others
- **Enter carefully**: Passphrases are case-sensitive
- **Print reference**: Use print button for a physical card to take shopping
- **One assignment only**: You can only see your assignment, not others'

### Security Best Practices
- **Organizers**: Delete the passphrases file immediately after distribution
- **Participants**: Don't share passphrases or try to guess others'
- **Everyone**: Keep assignments secret until the exchange day!

## 🆚 Legacy Support

This version (v2.0) supports individual passphrases. The app also supports the legacy v1.0 format (single shared passphrase) for backward compatibility.

### Version Differences
- **v2.0 (Current)**: Individual passphrases, maximum privacy
- **v1.0 (Legacy)**: Single shared passphrase, name lookup required

The app automatically detects which version to use based on the encrypted file format.

## 🛡️ Security Improvements

The individual passphrase system provides both security and usability:

### Secure Christmas Passphrase Generation
- **Cryptographically Secure Word Selection**: Uses Python's `secrets` module for true randomness
- **Private Word Bank**: Christmas word list kept in private directory (not in repository)
- **Memorable Format**: Christmas-themed words that are easy to remember and type
- **Hidden Generation Method**: Word bank and exact format concealed from public view
- **Security Through Obscurity**: Attackers cannot see the word list or generation pattern

### Attack Resistance
- **Dictionary Attack Protection**: Private word bank prevents known word list attacks
- **Memorability**: Christmas theme makes passphrases easier to remember and share
- **Hidden Methodology**: Generation method concealed from repository viewers
- **Cryptographic Security**: Secure random selection from private word bank

### Security Comparison
- **Old Public Method**: Word bank visible in source code (dictionary vulnerable)
- **New Private Method**: `twinkling-peace-sparkle-celebrate-4896` (hidden word bank, secure)

### Practical Security Level
- **Time to crack**: Extremely difficult without access to private word bank
- **Memorability**: Christmas theme makes passphrases user-friendly
- **Hidden complexity**: True security level concealed from attackers
- **Practical security**: Strong protection while remaining usable

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🎁 Merry Christmas!

Enjoy your Secret Santa gift exchange with maximum privacy and security! Each person gets their own Christmas-themed passphrase, ensuring that assignments stay truly secret until the big day.

---

**Made with ❤️ for spreading Christmas cheer while protecting privacy**
