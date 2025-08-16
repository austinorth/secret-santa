# 🎅 Secret Santa App - Developer Handoff Documentation (v2.0 - Individual Passphrases)

## 🏗️ **Architecture Overview**

This is a **React + TypeScript + Vite** application designed to run on **GitHub Pages** with **individual passphrase security**. The app now provides **maximum privacy** where each participant gets their own unique passphrase that only unlocks their specific assignment, preventing participants from seeing other assignments.

### **Core Challenge Solved**
- **Individual Privacy Protection**: Each participant can only access their own assignment
- **Organizer Blindness**: Even organizers cannot see assignments without individual passphrases
- **Stateful app on stateless hosting**: Uses AES-GCM encryption with individual passphrase keys
- **GitHub Pages deployment**: Fully static with automated CI/CD via GitHub Actions
- **Cross-platform assignment generation**: Python script with secure individual encryption

## 📁 **Project Structure**

```
secret-santa/
├── src/
│   ├── components/           # React components (currently empty, all in App.tsx)
│   ├── utils/               # Core utility modules
│   │   ├── encryption.ts    # Individual passphrase encryption/decryption
│   │   ├── csvParser.ts     # CSV parsing & individual assignment handling
│   │   └── fileUtils.ts     # File loading with v1.0/v2.0 format support
│   ├── App.tsx             # Main application (individual passphrase lookup)
│   ├── App.css             # Component-specific styles
│   ├── index.css           # Global styles with holiday theme
│   └── main.tsx            # React entry point
├── scripts/
│   ├── generate_assignments.py # Python script for individual encrypted assignments
│   ├── requirements.txt     # Python dependencies (cryptography)
│   └── README.md           # Python script documentation
├── public/
│   └── secret-santa-data.enc # Encrypted assignment data file (v2.0 format)
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions for auto-deployment
├── example-participants.csv # Test data for development
├── secret-santa-passphrases.csv # Generated passphrases (DELETE after distribution)
├── private/                # Private directory (.gitignored)
│   └── christmas_words.txt # Christmas word bank (kept secret)
└── venv/                   # Python virtual environment (local only)
```

## 🔧 **Key Technical Decisions**

### **Individual Passphrase Architecture (v2.0)**
- **Algorithm**: AES-GCM with 256-bit keys (same as v1.0)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Individual Encryption**: Each assignment encrypted separately with unique passphrase
- **Passphrase Generation**: Cryptographically secure Christmas-themed passphrases from private word bank
- **Lookup Method**: SHA-256 hash of passphrase used as lookup key (no identifying information)
- **Storage**: Encrypted assignments in JSON object with hashed passphrase keys

### **Data Format Evolution**
```json
// v2.0 Format (Individual Passphrases)
{
  "assignments": {
    "sha256_hash_of_passphrase_1": "encrypted_assignment_1",
    "sha256_hash_of_passphrase_2": "encrypted_assignment_2"
  },
  "timestamp": 1640995200000,
  "version": "2.0"
}

// v1.0 Format (Legacy - Single Passphrase)
{
  "data": "base64_encrypted_all_assignments",
  "timestamp": 1640995200000,
  "version": "1.0"
}
```

### **CSV Format (Unchanged)**
```csv
NAME,BIO,SO
John Doe,"Loves coffee and books. Gift ideas: coffee beans, novels",Jane Doe
Jane Doe,"Enjoys yoga and cooking. Gift ideas: yoga gear, cookbooks",John Doe
Charlie Smith,"Artist and photographer. Gift ideas: art supplies, camera gear",
```
- **NAME**: Full participant name (required)
- **BIO**: Interests and gift suggestions (can contain commas if quoted)
- **SO**: Significant Other name (optional, prevents pairing)

### **Assignment Algorithm (Enhanced)**
- Prevents self-assignment
- Prevents significant other pairing
- Uses random shuffling with conflict detection
- Retries up to 1000 times for valid assignments
- Generates unique passphrases for each participant
- Creates individual encrypted assignments

## 🎨 **Design System (Unchanged)**

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
- **Individual passphrase focused** interface
- **Clear privacy messaging** about individual access
- **User-friendly passphrases** with Christmas theme for memorability

## 🔄 **Application Flow (v2.0)**

### **For Organizers (Assignment Generation)**
1. **Prepare CSV** with participant data (NAME, BIO, SO columns)
2. **Run Python script**: `python scripts/generate_assignments.py participants.csv`
3. **Script generates**:
   - Individual assignments avoiding conflicts (self/SO pairings)
   - Unique passphrases for each participant
   - Individual encrypted assignments with hashed passphrase keys
4. **Files created**:
   - `public/secret-santa-data.enc` (commit to repo)
   - `secret-santa-passphrases.csv` (distribute then DELETE)
5. **Deploy**: Commit encrypted file and push for GitHub Pages auto-deployment
6. **Distribute passphrases**: Send each person ONLY their passphrase individually
7. **Security cleanup**: Delete passphrases file after distribution

### **For Participants (Individual Lookup)**
1. **Visit deployed site** - app automatically loads encrypted data
2. **Enter personal passphrase** to decrypt only their assignment
3. **View recipient** name and gift preferences
4. **Print reference card** for shopping
5. **Cannot access** other participants' assignments

## 🔐 **Security Architecture (v2.0)**

### **Individual Encryption Process**
1. **Passphrase Generation**: Unique Christmas-themed passphrase per participant
2. **Assignment Encryption**: Each assignment encrypted separately with participant's passphrase
3. **Key Hashing**: SHA-256 hash of passphrase used as lookup key (no identifying info)
4. **Data Storage**: Encrypted assignments stored with hashed keys in JSON object
5. **Lookup Process**: Participant's passphrase hashed to find their encrypted assignment

### **Privacy Guarantees**
- **Participant Privacy**: Can only decrypt and view their own assignment
- **Organizer Blindness**: Cannot see assignments without individual passphrases
- **Cross-Participant Security**: No way to access other participants' assignments
- **Zero Knowledge**: Encrypted file contains no identifying information

### **Security Considerations**
- **Passphrase Distribution**: Must be done individually and securely
- **File Cleanup**: Passphrases file must be deleted after distribution
- **Private Word Bank**: Christmas words kept in .gitignored private directory
- **Hidden Generation Method**: Word bank concealed from public repository
- **No Session Management**: Fully client-side, no persistent storage
- **Legacy Support**: Maintains backward compatibility with v1.0 format

## 🚨 **Known Issues & Considerations**

### **Current Limitations**
- **All UI logic in single App.tsx file** (needs component extraction)
- **No bulk passphrase distribution interface** (manual distribution required)
- **No assignment preview** for organizers before encryption
- **No passphrase recovery mechanism** (by design for security)

### **Security Trade-offs**
- **No organizer visibility**: Organizers cannot see assignments (feature, not bug)
- **Manual distribution required**: No automated passphrase sending
- **Lost passphrase = lost access**: No recovery mechanism by design
- **Individual file management**: Each participant needs their specific passphrase

### **UX Improvements Needed**
- Better loading states during encryption/decryption
- Component extraction from monolithic App.tsx
- Better mobile experience for passphrase entry
- Clearer privacy messaging and instructions

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

### **Individual Assignment Generation Workflow**
```bash
# 1. Ensure private word bank exists (one-time setup)
# The private/christmas_words.txt file should exist and be .gitignored

# 2. Generate encrypted assignments with individual passphrases
python scripts/generate_assignments.py participants.csv

# 3. Test locally with generated passphrases
npm run dev  # Verify individual passphrases work

# 4. Deploy encrypted file only (NEVER commit passphrases file)
git add public/secret-santa-data.enc
git commit -m "Update Secret Santa assignments"
git push origin main

# 5. Distribute passphrases individually
# Open secret-santa-passphrases.csv
# Send each person ONLY their passphrase (Christmas-themed words)
# Delete the file after distribution

# 6. Security cleanup
rm secret-santa-passphrases.csv
```

### **Deployment**
- **Auto-deployment** via GitHub Actions on push to main
- **Base path**: `/secret-santa/` for GitHub Pages
- **Build output**: `dist/` directory
- **Only encrypted file deployed**: Passphrases never committed

### **Testing Strategy**
- Use `example-participants.csv` for testing Python script
- Test each generated passphrase individually with development server
- Verify participants cannot access other assignments
- Check mobile responsiveness and print functionality
- Test legacy v1.0 format compatibility

## 🎯 **Immediate Improvement Opportunities**

### **Code Organization**
1. **Extract components** from App.tsx (IndividualLookup, LegacyLookup, etc.)
2. **Add TypeScript interfaces** for v2.0 data structures
3. **Implement proper error boundaries**
4. **Add unit tests** for individual encryption utilities

### **Feature Enhancements**
1. **Bulk passphrase distribution** interface (with security warnings)
2. **Assignment validation** before encryption
3. **Passphrase strength indicators**
4. **Better mobile passphrase entry** experience

### **UX Improvements**
1. **Progressive disclosure** of privacy features
2. **Better onboarding** flow explaining individual passphrases
3. **Assignment printing** with QR codes
4. **Offline functionality** for individual lookup

## 🔍 **Key Files to Understand**

1. **`scripts/generate_assignments.py`** - Python script for individual encrypted assignments
2. **`src/App.tsx`** - Main React application (individual passphrase interface)
3. **`src/utils/encryption.ts`** - Individual passphrase encryption/decryption
4. **`src/utils/fileUtils.ts`** - File loading with v1.0/v2.0 format detection
5. **`src/utils/csvParser.ts`** - Individual assignment parsing interfaces
6. **`vite.config.ts`** - Build configuration for GitHub Pages

## 💡 **Architecture Decisions Context**

### **Individual Christmas Passphrases**: Chosen for maximum privacy and memorability
- **Private word bank**: Christmas words kept in .gitignored directory for security
- **User-friendly format**: Christmas-themed words easier to remember than random characters
- **Hidden generation method**: Word bank concealed from public repository viewers
- **Single-file components**: Currently everything in App.tsx for simplicity
- **No external state management**: Uses React useState for all state
- **No backend**: Fully client-side to work with GitHub Pages
- **Holiday theming**: Specifically requested Christmas (not generic holiday) theme
- **Backward compatibility**: Supports both v1.0 (legacy) and v2.0 (individual) formats

## 🔐 **Encryption Data Flow (v2.0)**

### **File Format Structure**
```json
{
  "assignments": {
    "hash_of_passphrase_1": "base64_encrypted_assignment_1",
    "hash_of_passphrase_2": "base64_encrypted_assignment_2"
  },
  "timestamp": 1640995200000,
  "version": "2.0"
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

### **Individual Encryption Process (Python Script)**
1. **Parse CSV** → Participant objects with conflict detection
2. **Generate assignments** with SO avoidance and retry logic (up to 1000 attempts)
3. **Load private Christmas word bank** from private/christmas_words.txt (not in repository)
4. **Create individual passphrases** using cryptographically secure word selection
5. **Encrypt each assignment separately** with participant's passphrase using AES-GCM + PBKDF2
6. **Hash passphrases** with SHA-256 to create lookup keys (removes identifying information)
7. **Output encrypted file** with hashed keys and individual encrypted assignments
8. **Output passphrases file** for distribution (DELETE after use)

### **Individual Decryption Process (Browser)**
1. **Load encrypted file** from public directory
2. **Hash user's passphrase** with SHA-256 to create lookup key
3. **Find encrypted assignment** using hashed passphrase as key
4. **Decrypt assignment** using original passphrase and AES-GCM
5. **Display only that assignment** (no access to others)

## 🎄 **Theme & Styling Notes**

- **Christmas-specific branding** (not generic "holiday")
- **Emoji usage**: 🎅 🎄 🎁 🔐 for visual hierarchy and security messaging
- **Print styles**: Optimized for reference cards
- **Responsive breakpoints**: 768px (tablet), 480px (mobile)
- **Accessibility**: Color contrast compliant, keyboard navigation
- **Privacy indicators**: Clear messaging about individual access

## ⚠️ **Critical Dependencies**

### **Frontend (Browser)**
- **Web Crypto API**: Required for individual decryption (modern browsers only)
- **SHA-256 hashing**: For passphrase-to-key conversion
- **Fetch API**: Automatically loads encrypted data from public directory
- **localStorage**: Used for backup storage (graceful degradation)

### **Backend (Python Script)**
- **Python 3.7+**: Required for script execution
- **cryptography package**: Provides AES-GCM encryption compatible with Web Crypto API
- **hashlib**: Built-in SHA-256 hashing for passphrase keys
- **Virtual environment**: Recommended for dependency isolation

## 🚀 **Deployment Checklist**

### **Initial Setup**
1. **Enable GitHub Pages** in repository settings
2. **Update `vite.config.ts`** base path if repo name changes
3. **Set up Python environment** for assignment generation

### **Per-Event Deployment (v2.0)**
1. **Prepare participant CSV** with NAME, BIO, SO columns
2. **Run Python script** to generate individual encrypted assignments
3. **Test locally** with development server using generated passphrases
4. **Commit encrypted file ONLY** to repository (never commit passphrases file)
5. **Push to main branch** for auto-deployment via GitHub Actions
6. **Distribute passphrases individually** to participants
7. **Delete passphrases file** immediately after distribution
8. **Verify deployed site** works with individual passphrases

### **Security Checklist**
- [ ] Encrypted file committed and deployed
- [ ] Individual passphrases distributed securely
- [ ] Passphrases file deleted from local system
- [ ] No identifying information in encrypted file
- [ ] Each participant tested with their specific passphrase

## 🤖 **AI Development Notes**

- **Framework match**: Uses same React+Vite stack as austinorth.com
- **Design constraints**: Minimalist + Christmas theme specifically requested
- **Privacy requirement**: **Enhanced** - participants AND organizers cannot see other assignments
- **Individual security**: Each person gets unique passphrase for maximum privacy
- **Hosting constraint**: Must work on GitHub Pages (static only)
- **Crypto solution**: Python script with individual encryption replaces shared passphrase approach
- **Cross-platform**: Mac-compatible Python development with venv isolation
- **User experience**: All error messages use proper error instances for better debugging
- **Backward compatibility**: Supports legacy v1.0 format for existing users

## 🐍 **Python Script Architecture (v2.0)**

### **Design Decisions**
- **Individual passphrase generation**: Unique Christmas-themed passphrases per participant
- **Separate encryption**: Each assignment encrypted individually (not bulk)
- **Hashed lookup keys**: SHA-256 of passphrases used as keys (removes identifying info)
- **No cross