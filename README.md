# 🎅 Secret Santa

A secure, stateless Secret Santa gift exchange application designed to run on GitHub Pages while maintaining privacy and security of assignments.

## ✨ Features

- **🔒 Secure & Private**: Uses AES-GCM encryption to protect Secret Santa assignments
- **🌐 GitHub Pages Compatible**: Fully static app that works with GitHub Pages hosting
- **📱 Responsive Design**: Beautiful Christmas-themed UI that works on all devices
- **🖨️ Print-Friendly**: Clean print layout for physical reference cards
- **⚙️ Script-Based Setup**: Simple Node.js script to generate assignments
- **🚫 Smart Constraints**: Prevents self-assignment and significant other matches

## 🎯 How It Works

This app solves the challenge of hosting a stateful Secret Santa application on static hosting (GitHub Pages) by using client-side encryption:

1. **CSV Preparation**: Create a CSV file with participant data (NAME, BIO, SO)
2. **Script Generation**: Run the Node.js script to create encrypted assignments
3. **Deployment**: Encrypted file is automatically saved and deployed with the app
4. **Lookup**: Participants enter the passphrase and their name to see assignments

## 🚀 Quick Start

### For Participants

1. Visit the deployed app
2. Enter the passphrase provided by your organizer
3. Enter your name in the lookup field
4. View your Secret Santa recipient and their gift preferences
5. Use the print button for a physical reference card

### For Organizers

1. **Prepare Your Data**: Create a CSV file with columns: `NAME`, `BIO`, `SO`
   ```csv
   NAME,BIO,SO
   John Doe,"Loves coffee and hiking. Gift ideas: coffee beans, books",Jane Doe
   Jane Doe,"Enjoys cooking and yoga. Gift ideas: tea sets, plants",John Doe
   Alice Smith,"Photography enthusiast. Gift ideas: camera accessories",
   ```

2. **Generate Assignments**:
   ```bash
   # Install dependencies (first time only)
   npm install
   
   # Set up Python environment and generate encrypted data
   python3 -m venv venv
   source venv/bin/activate
   pip install cryptography
   python scripts/generate_assignments.py your-participants.csv
   ```

3. **Deploy**:
   ```bash
   # Commit the generated encrypted file
   git add public/secret-santa-data.enc
   git commit -m "Add Secret Santa assignments"
   git push
   ```

4. **Share**: Give participants the passphrase (saved in `passphrase.txt`)

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
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd secret-santa

# Install dependencies
npm install

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
# Generate from your CSV file
python scripts/generate_assignments.py my-participants.csv

# Or use the example file for testing
python scripts/generate_assignments.py example-participants.csv
```

### What Happens

1. **Reads your CSV** and validates the format
2. **Generates assignments** avoiding conflicts (self/SO pairings)
3. **Creates a passphrase** using Christmas-themed words
4. **Encrypts the data** using strong AES-GCM encryption
5. **Saves files**:
   - `public/secret-santa-data.enc` (commit this)
   - `passphrase.txt` (share this, don't commit)

### Example Output

```
🎄 Generating Secret Santa assignments...
📁 Read CSV file: my-participants.csv
👥 Parsed 5 participants
🎁 Generated 5 assignments
🔑 Generated passphrase: snowflake-mistletoe-gift-789
💾 Saved encrypted data to: public/secret-santa-data.enc
🔐 Saved passphrase to: passphrase.txt

✅ Secret Santa data generated successfully!

🎅 Passphrase: snowflake-mistletoe-gift-789

📊 Summary:
   John Doe → Alice Smith
   Alice Smith → Bob Johnson
   Bob Johnson → Charlie Wilson
   Charlie Wilson → Jane Doe
   Jane Doe → John Doe
```

## 🚀 Deployment

### GitHub Pages (Recommended)

1. **Enable GitHub Pages**:
   - Go to repository settings → Pages
   - Set source to "GitHub Actions"

2. **Deploy**:
   ```bash
   # Generate your data
   python scripts/generate_assignments.py my-participants.csv
   
   # Commit and push
   git add public/secret-santa-data.enc
   git commit -m "Add Secret Santa assignments"
   git push
   ```

3. **Share**: Give participants the URL and passphrase

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
│   ├── generate_assignments.py     # Python data generation script
│   ├── requirements.txt            # Python dependencies
│   └── README.md                   # Script documentation
├── src/
│   ├── components/                 # React components
│   ├── utils/                      # Encryption & parsing utilities
│   └── App.tsx                     # Main app (participant lookup only)
├── public/
│   └── secret-santa-data.enc       # Generated encrypted data
├── example-participants.csv        # Example CSV file
└── venv/                           # Python virtual environment (local only)
```

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

### App Features
The app is streamlined for participant lookup only:
- Automatic data loading from `public/secret-santa-data.enc`
- Passphrase input for decryption
- Name lookup functionality
- Print-friendly assignment cards

## 🔒 Security Considerations

- **Client-Side Encryption**: All encryption happens in the browser
- **No Server Storage**: No sensitive data stored on servers
- **Strong Encryption**: AES-GCM with PBKDF2 key derivation
- **Passphrase Protection**: Only those with passphrase can decrypt
- **Organizer Privacy**: Organizers can't see actual assignments

## 🐛 Troubleshooting

### Script Issues

**"CSV file not found"**
- Check the file path is correct relative to project root
- Ensure the CSV file exists and is readable

**"Need at least 2 participants"**
- Your CSV needs minimum 2 people
- Check that NAME column has valid entries

**"Could not generate valid assignments"**
- Too many SO constraints for the participant count
- Try reducing significant other pairings

### App Issues

**"No Secret Santa data found"**
- Run the generation script first: `python scripts/generate_assignments.py your-file.csv`
- Ensure `public/secret-santa-data.enc` exists
- Verify the file was committed and deployed

**"Failed to decrypt data"**
- Check the passphrase is entered correctly
- Verify you're using the passphrase from `passphrase.txt`

**"No assignment found"**
- Enter your name exactly as it appears in the CSV
- Names are case-insensitive but must match otherwise

## 💡 Complete Workflow Example

```bash
# 1. Setup (first time only)
git clone <your-repo>
cd secret-santa
npm install
python3 -m venv venv
source venv/bin/activate
pip install cryptography

# 2. Create your participant list
cp example-participants.csv my-family.csv
# Edit my-family.csv with your actual participants

# 3. Generate encrypted assignments
python scripts/generate_assignments.py my-family.csv
# Note the passphrase that's displayed

# 4. Deploy
git add public/secret-santa-data.enc
git commit -m "Add Secret Santa assignments"
git push

# 5. Share with participants
echo "Visit: https://yourusername.github.io/secret-santa/"
cat passphrase.txt

# 6. Cleanup
rm passphrase.txt my-family.csv
```

## 🎄 Usage Tips

### For Organizers
- **Test first**: Use `example-participants.csv` to test the system
- **Save passphrase**: Copy it from `passphrase.txt` before cleanup
- **One-time setup**: Generate data once, share URL and passphrase
- **Privacy**: You won't see who gives to whom (only encrypted data)

### For Participants  
- **Get passphrase**: Ask your organizer for the passphrase
- **Enter correctly**: Names must match exactly (case-insensitive)
- **Print reference**: Use print button for a physical card
- **Keep secret**: Don't share your assignment!

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🎁 Merry Christmas!

Enjoy your Secret Santa gift exchange! Remember to keep assignments secret until the big day!

---

**Made with ❤️ for spreading Christmas cheer**