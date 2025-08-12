# 🎅 Secret Santa

A secure, stateless Secret Santa gift exchange application designed to run on GitHub Pages while maintaining privacy and security of assignments.

## ✨ Features

- **🔒 Secure & Private**: Uses AES-GCM encryption to protect Secret Santa assignments
- **🌐 GitHub Pages Compatible**: Fully static app that works with GitHub Pages hosting
- **📱 Responsive Design**: Beautiful Christmas-themed UI that works on all devices
- **🖨️ Print-Friendly**: Clean print layout for physical reference cards
- **⚙️ Easy Admin Panel**: Simple CSV upload to generate assignments
- **🚫 Smart Constraints**: Prevents self-assignment and significant other matches

## 🎯 How It Works

This app solves the challenge of hosting a stateful Secret Santa application on static hosting (GitHub Pages) by using client-side encryption:

1. **CSV Upload**: Admin uploads a CSV with participant data (NAME, BIO, SO)
2. **Assignment Generation**: App creates Secret Santa assignments avoiding conflicts
3. **Encryption**: Assignments are encrypted and downloaded as a file
4. **Deployment**: Encrypted file is added to the repo and deployed with the app
5. **Lookup**: Participants enter their name to see their assignment

## 🚀 Quick Start

### For Participants

1. Visit the deployed app
2. Enter your name in the lookup field
3. Press Enter or click "Find My Assignment"
4. View your Secret Santa recipient and their gift preferences
5. Use the print button for a physical reference card

### For Organizers

1. **Prepare Your Data**: Create a CSV file with columns: `NAME`, `BIO`, `SO`
   - `NAME`: Full name of participant
   - `BIO`: Hobbies, interests, and gift suggestions
   - `SO`: Significant other's name (leave empty if none)

2. **Generate Assignments**:
   - Open the admin panel
   - Upload your CSV file
   - App will generate assignments and download an encrypted file
   - Save the passphrase that's displayed

3. **Deploy**:
   - Replace `public/secret-santa-data.enc` with your downloaded file
   - Commit and push to GitHub
   - GitHub Actions will automatically deploy

## 📋 CSV Format

Download the template from the admin panel or use this format:

```csv
NAME,BIO,SO
John Doe,"Loves coffee, hiking, and board games. Good books: fantasy novels. Gift ideas: coffee beans, hiking gear, board games",Jane Doe
Jane Doe,"Enjoys cooking, yoga, and gardening. Loves tea and handmade items. Gift ideas: cooking utensils, tea sets, plants",John Doe
Alice Smith,"Photography enthusiast, loves travel and art. Gift ideas: camera accessories, art supplies, travel guides",
Bob Johnson,"Tech lover, enjoys video games and programming. Gift ideas: gadgets, games, tech books",
```

**Important Notes:**
- Use quotes around BIO entries that contain commas
- SO column can be empty for participants without significant others
- Names in SO column must exactly match a NAME in the list

## 🛠️ Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn

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

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### GitHub Pages (Recommended)

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

2. **Configure Repository**:
   - Ensure `vite.config.ts` has the correct `base` path
   - The workflow file is already configured in `.github/workflows/deploy.yml`

3. **Initial Deploy**:
   - Push to the `main` branch
   - GitHub Actions will automatically build and deploy
   - Your app will be available at `https://username.github.io/secret-santa/`

4. **Deploy with Secret Santa Data**:
   - Generate your encrypted data using the admin panel
   - Replace `public/secret-santa-data.enc` with your generated file
   - Commit and push the changes
   - GitHub Actions will redeploy with your data

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
  // ... other config
})
```

### Encryption Settings
Encryption settings are configured in `src/utils/encryption.ts`. The current setup uses:
- Algorithm: AES-GCM
- Key Length: 256 bits
- PBKDF2 iterations: 100,000
- Random salt and IV generation

## 🎨 Customization

### Theme Colors
Edit the CSS variables in `src/index.css`:

```css
:root {
  --holly-green: #0f5132;
  --cranberry-red: #dc3545;
  --snow-white: #ffffff;
  /* ... other colors */
}
```

### Adding Features
The app is built with React + TypeScript and uses a modular structure:
- `src/components/`: React components
- `src/utils/`: Utility functions for encryption, CSV parsing, and file handling
- `src/App.tsx`: Main application component

## 🔒 Security Considerations

- **Client-Side Only**: All encryption/decryption happens in the browser
- **No Server Storage**: No sensitive data is stored on servers
- **Strong Encryption**: Uses Web Crypto API with AES-GCM
- **Passphrase Protection**: Assignments are protected by a strong passphrase
- **Local Backup**: Data is backed up to localStorage for convenience

## 🐛 Troubleshooting

### "No Secret Santa data found"
- Ensure the encrypted data file is properly uploaded to `public/secret-santa-data.enc`
- Check that the file has the correct JSON structure
- Verify the passphrase is correct

### "Name not found"
- Check that the name exactly matches what's in the CSV
- Names are case-insensitive but must match exactly otherwise
- Ensure the encrypted data was generated successfully

### Build/Deploy Issues
- Verify Node.js version (18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check GitHub Actions logs for deployment errors

## 🚀 Quick Deployment Guide

1. **Fork/Clone this repository**
2. **Enable GitHub Pages** in repository settings
3. **First deployment** will have empty data (expected)
4. **Generate your assignments**:
   - Visit the deployed site
   - Use admin panel to upload CSV and generate encrypted data
   - Download the encrypted file
5. **Deploy with data**:
   - Replace `public/secret-santa-data.enc` with your file
   - Commit and push to automatically redeploy

## 💡 Usage Tips

### For Organizers
- **Test first**: Use the example CSV file to test the system
- **Save everything**: Keep both the encrypted file and passphrase safe
- **Share wisely**: Only share the deployed URL, never the passphrase
- **Backup**: The passphrase is your only way to decrypt the data

### For Participants
- **Case sensitive**: Enter your name exactly as it appears in the CSV
- **Print option**: Use the print button for a nice reference card
- **Keep secret**: Don't share your assignment with others!

### Troubleshooting
- **"Name not found"**: Check spelling and ensure data is loaded
- **"No data found"**: Contact organizer to verify deployment
- **Decryption errors**: Verify the correct passphrase is being used

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎄 Merry Christmas!

Enjoy your Secret Santa gift exchange! Remember to keep assignments secret until the big day! 🎁

---

**Made with ❤️ for spreading Christmas cheer**
