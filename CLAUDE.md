# 🎅 Secret Santa App - Developer Handoff Documentation (v2.0 - Enhanced UI)

## 🏗️ **Architecture Overview**

This is a **React + TypeScript + Vite** application designed to run on **GitHub Pages** with **individual passphrase security** and **enhanced festive UI**. The app provides **maximum privacy** where each participant gets their own unique passphrase that only unlocks their specific assignment, with a beautiful Christmas-themed interface featuring animated snow effects.

### **Core Challenge Solved**
- **Individual Privacy Protection**: Each participant can only access their own assignment
- **Organizer Blindness**: Even organizers cannot see assignments without individual passphrases
- **Stateful app on stateless hosting**: Uses AES-GCM encryption with individual passphrase keys
- **GitHub Pages deployment**: Fully static with automated CI/CD via GitHub Actions
- **Cross-platform assignment generation**: Python script with secure individual encryption
- **Festive User Experience**: Enhanced Christmas-themed UI with animated snow and unified design

## 📁 **Project Structure**

```
secret-santa/
├── src/
│   ├── components/           # React components (currently empty, all in App.tsx)
│   ├── utils/               # Core utility modules
│   │   ├── encryption.ts    # Individual passphrase encryption/decryption
│   │   ├── csvParser.ts     # CSV parsing & individual assignment handling
│   │   └── fileUtils.ts     # File loading (v2.0 format only)
│   ├── App.tsx             # Main application (individual passphrase lookup)
│   ├── App.css             # Enhanced festive component styles
│   ├── index.css           # Global styles with animated snow and Christmas theme
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

### **Individual Passphrase Architecture (v2.0 - Simplified)**
- **Algorithm**: AES-GCM with 256-bit keys
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Individual Encryption**: Each assignment encrypted separately with unique passphrase
- **Passphrase Generation**: Cryptographically secure Christmas-themed passphrases from private word bank
- **Lookup Method**: SHA-256 hash of passphrase used as lookup key (no identifying information)
- **Legacy Support Removed**: No longer supports v1.0 format - simplified to v2.0 only
- **Storage**: Encrypted assignments in JSON object with hashed passphrase keys

### **Data Format (v2.0 Only)**
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
```
**Note**: Legacy v1.0 format support has been completely removed for simplicity.

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

## 🎨 **Design System (Enhanced)**

### **Color Palette (CSS Variables)**
```css
--holly-green: #0f5132      /* Primary brand color */
--cranberry-red: #dc3545    /* Accent/error color */
--snow-white: #ffffff       /* Background/cards */
--warm-cream: #f8f9fa       /* Subtle background */
--gold: #ffc107             /* Highlights/warnings */
--christmas-gold: #ffd700   /* Enhanced gold accents */
--midnight-blue: #191970    /* Background gradients */
--forest-green: #228b22     /* Button gradients */
```

### **UI Philosophy**
- **Enhanced Christmas theme** with animated snow and festive effects
- **Mobile-first responsive design**
- **Print-friendly styling** for gift reference cards
- **Individual passphrase focused** interface
- **Unified, flowing layout** - reduced visual segmentation
- **User-friendly passphrases** with Christmas theme for memorability
- **Glassmorphism effects** with backdrop blur and subtle gradients
- **Animated background elements** - falling snow and Christmas lights

## 🔄 **Application Flow (v2.0 - Simplified)**

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
1. **Visit deployed site** - beautiful Christmas interface with animated snow
2. **Enter personal passphrase** to decrypt only their assignment
3. **View unified assignment card** with recipient name and gift preferences
4. **Print reference card** for shopping
5. **Cannot access** other participants' assignments
6. **Single-use experience** - no option to change passphrases or look up others

## 🔐 **Security Architecture (v2.0 - Simplified)**

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
- **No Legacy Support**: v1.0 format support completely removed for simplicity
- **Single Assignment Access**: No multi-lookup capability for enhanced privacy

## 🚨 **Recent Improvements & Current State**

### **UI Enhancements Completed**
- **Unified assignment layout**: Single flowing card instead of segmented sections
- **Animated snow background**: 20 snowflakes with varying speeds and paths
- **Christmas lights header**: Animated sparkling lights at top of page
- **Enhanced gradients and glassmorphism**: Backdrop blur effects throughout
- **Reduced redundancy**: Eliminated duplicate welcome messages and text
- **Simplified user flow**: Removed version conditionals and legacy support
- **Improved spacing**: Better visual rhythm and reduced awkward whitespace

### **Current Limitations**
- **All UI logic in single App.tsx file** (needs component extraction)
- **No bulk passphrase distribution interface** (manual distribution required)
- **No assignment preview** for organizers before encryption
- **No passphrase recovery mechanism** (by design for security)

### **Architecture Simplifications**
- **Removed legacy support**: No more v1.0 format handling
- **Single passphrase per user**: No option to change or look up multiple assignments
- **Cleaner codebase**: Eliminated version conditionals and unused components

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
2. **`src/App.tsx`** - Main React application with enhanced festive UI
3. **`src/utils/encryption.ts`** - Individual passphrase encryption/decryption
4. **`src/utils/fileUtils.ts`** - File loading (v2.0 format only)
5. **`src/utils/csvParser.ts`** - Individual assignment parsing interfaces
6. **`src/index.css`** - Animated snow effects and Christmas styling
7. **`src/App.css`** - Unified assignment layout and glassmorphism effects
8. **`vite.config.ts`** - Build configuration for GitHub Pages

## 💡 **Architecture Decisions Context**

### **Individual Christmas Passphrases**: Chosen for maximum privacy and memorability
- **Private word bank**: Christmas words kept in .gitignored directory for security
- **User-friendly format**: Christmas-themed words easier to remember than random characters
- **Hidden generation method**: Word bank concealed from public repository viewers
- **Single-file components**: Currently everything in App.tsx for simplicity
- **No external state management**: Uses React useState for all state
- **No backend**: Fully client-side to work with GitHub Pages
- **Enhanced Christmas theming**: Animated snow, Christmas lights, and festive gradients
- **Simplified architecture**: Removed all legacy v1.0 support for cleaner codebase
- **Unified UX**: Single flowing assignment display instead of segmented sections

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
- **Design evolution**: Enhanced from minimalist to rich Christmas theme with animations
- **Privacy requirement**: **Enhanced** - participants AND organizers cannot see other assignments
- **Individual security**: Each person gets unique passphrase for maximum privacy
- **Hosting constraint**: Must work on GitHub Pages (static only)
- **Crypto solution**: Python script with individual encryption replaces shared passphrase approach
- **Cross-platform**: Mac-compatible Python development with venv isolation
- **User experience**: All error messages use proper error instances for better debugging
- **Architecture simplification**: Removed all legacy v1.0 support in latest version
- **UI enhancements**: Added animated snow, glassmorphism, and unified layout design
- **Reduced redundancy**: Cleaned up duplicate messages and simplified user flow

## 🐍 **Python Script Architecture (v2.0)**

### **Design Decisions**
- **Individual passphrase generation**: Unique Christmas-themed passphrases per participant
- **Separate encryption**: Each assignment encrypted individually (not bulk)
- **Hashed lookup keys**: SHA-256 of passphrases used as keys (removes identifying info)
- **No cross