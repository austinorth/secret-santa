# 🎅 Secret Santa App - Developer Handoff Documentation

## 🏗️ **Architecture Overview**

This is a **React + TypeScript + Vite** application designed to run on **GitHub Pages** while maintaining stateful functionality through client-side encryption. The app solves the challenge of hosting a Secret Santa coordination tool on static hosting by encrypting assignment data client-side.

### **Core Challenge Solved**
- **Stateful app on stateless hosting**: Uses AES-GCM encryption to store Secret Santa assignments in encrypted files
- **Privacy protection**: Organizer cannot see actual assignments, only encrypted data
- **GitHub Pages deployment**: Fully static with automated CI/CD via GitHub Actions
- **Cross-platform assignment generation**: Python script replaces problematic Web Crypto API for reliable encryption

## 📁 **Project Structure**

```
secret-santa/
├── src/
│   ├── components/           # React components (currently empty, all in App.tsx)
│   ├── utils/               # Core utility modules
│   │   ├── encryption.ts    # AES-GCM decryption only (browser-side)
│   │   ├── csvParser.ts     # CSV parsing interfaces & data structures
│   │   └── fileUtils.ts     # File loading and local storage handling
│   ├── App.tsx             # Main application component (participant lookup)
│   ├── App.css             # Component-specific styles
│   ├── index.css           # Global styles with holiday theme
│   └── main.tsx            # React entry point
├── scripts/
│   ├── generate_assignments.py # Python script for creating encrypted assignments
│   ├── requirements.txt     # Python dependencies (cryptography)
│   └── README.md           # Python script documentation
├── public/
│   └── secret-santa-data.enc # Encrypted assignment data file
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions for auto-deployment
├── example-participants.csv # Test data for development
└── venv/                   # Python virtual environment (local only)
```

## 🔧 **Key Technical Decisions**

### **Encryption Implementation**
- **Algorithm**: AES-GCM with 256-bit keys
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Passphrase Generation**: Random holiday-themed words + numbers
- **Storage**: Encrypted data stored as base64 in JSON files

### **CSV Format**
```csv
NAME,BIO,SO
John Doe,"Loves coffee and books. Gift ideas: coffee beans, novels",Jane Doe
Jane Doe,"Enjoys yoga and cooking. Gift ideas: yoga gear, cookbooks",John Doe
Charlie Smith,"Artist and photographer. Gift ideas: art supplies, camera gear",
```
- **NAME**: Full participant name (required)
- **BIO**: Interests and gift suggestions (can contain commas if quoted)
- **SO**: Significant Other name (optional, prevents pairing)

### **Assignment Algorithm**
- Prevents self-assignment
- Prevents significant other pairing
- Uses random shuffling with conflict detection
- Retries up to 1000 times for valid assignments

## 🎨 **Design System**

### **Color Palette (CSS Variables)**
```css
--holly-green: #0f5132    /* Primary brand color */
--cranberry-red: #dc3545  /* Accent/error color */
--snow-white: #ffffff     /* Background/cards */
--warm-cream: #f8f9fa     /* Subtle background */
--gold: #ffc107           /* Highlights/warnings */
```

### **UI Philosophy**
- **Minimalist Christmas theme** (as specifically requested)
- **Mobile-first responsive design**
- **Print-friendly styling** for gift reference cards
- **Clear separation** between participant and admin interfaces

## 🔄 **Application Flow**

### **For Organizers (Assignment Generation)**
1. **Prepare CSV** with participant data (NAME, BIO, SO columns)
2. **Run Python script**: `python scripts/generate_assignments.py`
3. **Script generates assignments** avoiding conflicts (self/SO pairings)
4. **Data encrypted** with auto-generated holiday-themed passphrase
5. **Update repo**: Replace `public/secret-santa-data.enc` with generated file
6. **Deploy**: Commit and push for GitHub Pages auto-deployment
7. **Share passphrase** with participants

### **For Participants (Lookup Mode)**
1. **Visit deployed site** - app automatically loads encrypted data
2. **Enter passphrase** to decrypt assignments
3. **Search by name** to find Secret Santa assignment
4. **View recipient** name and gift preferences
5. **Print reference card** or lookup another person

## 🚨 **Known Issues & Considerations**

### **Current Limitations**
- **All UI logic in single App.tsx file** (needs component extraction)
- **No input validation** for participant names in lookup
- **No assignment preview** for organizers before encryption
- **Manual file replacement** required for deployment (no web admin interface)

### **Security Considerations**
- **Passphrase is displayed in plain text** (intentional for usability)
- **localStorage backup** may persist sensitive data
- **No session management** (fully client-side)

### **UX Improvements Needed**
- Better loading states during encryption/decryption
- Bulk name lookup functionality
- Assignment statistics for organizers
- Better mobile experience for file uploads

## 🛠️ **Development Workflow**

### **Frontend Setup**
```bash
npm install
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
```

### **Python Script Setup**
```bash
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
pip install cryptography
```

### **Assignment Generation Workflow**
```bash
# 1. Generate encrypted assignments
python scripts/generate_assignments.py [csv_file]

# 2. Test locally
npm run dev  # Verify passphrase works and lookups function

# 3. Deploy
git add public/secret-santa-data.enc
git commit -m "Update Secret Santa assignments"
git push origin main
```

### **Deployment**
- **Auto-deployment** via GitHub Actions on push to main
- **Base path**: `/secret-santa/` for GitHub Pages
- **Build output**: `dist/` directory

### **Testing Strategy**
- Use `example-participants.csv` for testing Python script
- Test generated passphrase with development server
- Verify participant name lookups work correctly
- Check mobile responsiveness and print functionality

## 🎯 **Immediate Improvement Opportunities**

### **Code Organization**
1. **Extract components** from App.tsx (ParticipantLookup, AdminPanel, etc.)
2. **Add TypeScript interfaces** for better type safety
3. **Implement proper error boundaries**
4. **Add unit tests** for utility functions

### **Feature Enhancements**
1. **Assignment preview** before encryption
2. **Bulk CSV validation** with detailed error reporting
3. **Assignment statistics** (who has whom, conflict detection)
4. **Better mobile file upload** experience

### **UX Improvements**
1. **Progressive disclosure** of admin features
2. **Better onboarding** flow for first-time users
3. **Assignment printing** with QR codes
4. **Offline functionality** for participant lookup

## 🔍 **Key Files to Understand**

1. **`scripts/generate_assignments.py`** - Python script for creating encrypted assignments
2. **`src/App.tsx`** - Main React application (participant lookup interface)
3. **`src/utils/encryption.ts`** - Browser-side decryption functionality
4. **`src/utils/fileUtils.ts`** - File loading and automatic data fetching
5. **`src/utils/csvParser.ts`** - Data structures and parsing interfaces
6. **`vite.config.ts`** - Build configuration for GitHub Pages

## 💡 **Architecture Decisions Context**

- **Single-file components**: Currently everything in App.tsx for simplicity
- **No external state management**: Uses React useState for all state
- **No backend**: Fully client-side to work with GitHub Pages
- **Holiday theming**: Specifically requested Christmas (not generic holiday) theme
- **Encryption approach**: Chosen for privacy and GitHub Pages compatibility

## 🔐 **Encryption Data Flow**

### **File Format Structure**
```json
{
  "data": "base64_encrypted_assignments",
  "timestamp": 1640995200000,
  "version": "1.0"
}
```

### **Assignment Data Structure**
```typescript
interface SecretSantaAssignment {
  giver: string;
  recipient: string;
  recipientBio: string;
}
```

### **Encryption Process (Python Script)**
1. **Parse CSV** → Participant objects with conflict detection
2. **Generate assignments** with SO avoidance and retry logic (up to 1000 attempts)
3. **Create passphrase** using holiday-themed words + random number
4. **Encrypt data** with AES-GCM + PBKDF2 key derivation (100k iterations)
5. **Output file** in JSON format with base64 encrypted payload
6. **Compatible format** with Web Crypto API for browser decryption

## 🎄 **Theme & Styling Notes**

- **Christmas-specific branding** (not generic "holiday")
- **Emoji usage**: 🎅 🎄 🎁 for visual hierarchy
- **Print styles**: Optimized for reference cards
- **Responsive breakpoints**: 768px (tablet), 480px (mobile)
- **Accessibility**: Color contrast compliant, keyboard navigation

## ⚠️ **Critical Dependencies**

### **Frontend (Browser)**
- **Web Crypto API**: Required for decryption (modern browsers only)
- **Fetch API**: Automatically loads encrypted data from public directory
- **localStorage**: Used for backup storage (graceful degradation)

### **Backend (Python Script)**
- **Python 3.7+**: Required for script execution
- **cryptography package**: Provides AES-GCM encryption compatible with Web Crypto API
- **Virtual environment**: Recommended for dependency isolation

## 🚀 **Deployment Checklist**

### **Initial Setup**
1. **Enable GitHub Pages** in repository settings
2. **Update `vite.config.ts`** base path if repo name changes
3. **Set up Python environment** for assignment generation

### **Per-Event Deployment**
1. **Prepare participant CSV** with NAME, BIO, SO columns
2. **Run Python script** to generate encrypted assignments
3. **Test locally** with development server and generated passphrase
4. **Commit encrypted file** to repository
5. **Push to main branch** for auto-deployment via GitHub Actions
6. **Share passphrase** with participants
7. **Verify deployed site** works on actual devices

This codebase successfully solves a unique problem (stateful app on static hosting) with a clean, working solution that just needs better organization and component extraction for maintainability.

## 🤖 **AI Development Notes**

- **Framework match**: Uses same React+Vite stack as austinorth.com
- **Design constraints**: Minimalist + Christmas theme specifically requested
- **Privacy requirement**: Organizer must not see actual assignments
- **Hosting constraint**: Must work on GitHub Pages (static only)
- **Crypto solution**: Python script replaces problematic Web Crypto API admin functionality
- **Cross-platform**: Mac-compatible Python development with venv isolation
- **User experience**: All error messages use proper error instances for better debugging

## 🐍 **Python Script Architecture**

### **Design Decisions**
- **Standalone script**: No web interface needed for assignment generation
- **Compatible encryption**: Uses same AES-GCM format as Web Crypto API
- **Holiday theming**: Auto-generated passphrases use Christmas vocabulary
- **Robust conflict resolution**: Handles significant other constraints with retry logic
- **Clear output**: Provides passphrase, file location, and next steps

### **Security Approach**
- **PBKDF2 key derivation**: 100,000 iterations with SHA-256
- **Proper randomness**: Uses Python's `secrets` module for cryptographic operations
- **No key storage**: Passphrase must be shared manually (intentional design)
- **Format compatibility**: Exactly matches browser expectations for seamless decryption