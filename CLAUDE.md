# 🎅 Secret Santa App - Developer Handoff Documentation

## 🏗️ **Architecture Overview**

This is a **React + TypeScript + Vite** application designed to run on **GitHub Pages** while maintaining stateful functionality through client-side encryption. The app solves the challenge of hosting a Secret Santa coordination tool on static hosting by encrypting assignment data client-side.

### **Core Challenge Solved**
- **Stateful app on stateless hosting**: Uses AES-GCM encryption to store Secret Santa assignments in encrypted files
- **Privacy protection**: Organizer cannot see actual assignments, only encrypted data
- **GitHub Pages deployment**: Fully static with automated CI/CD via GitHub Actions

## 📁 **Project Structure**

```
secret-santa/
├── src/
│   ├── components/           # React components (currently empty, all in App.tsx)
│   ├── utils/               # Core utility modules
│   │   ├── encryption.ts    # AES-GCM encryption/decryption
│   │   ├── csvParser.ts     # CSV parsing & assignment generation
│   │   └── fileUtils.ts     # File download/upload handling
│   ├── App.tsx             # Main application component (all UI logic)
│   ├── App.css             # Component-specific styles
│   ├── index.css           # Global styles with holiday theme
│   └── main.tsx            # React entry point
├── public/
│   └── secret-santa-data.enc # Stub encrypted data file for deployment
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions for auto-deployment
└── example-participants.csv # Test data for development
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

### **For Organizers (Admin Mode)**
1. Upload CSV with participant data
2. App generates assignments avoiding conflicts
3. Data is encrypted with auto-generated passphrase
4. Download encrypted file via explicit download button
5. Replace `public/secret-santa-data.enc` in repo
6. Commit and push for auto-deployment

### **For Participants (Lookup Mode)**
1. Enter name in search field
2. Receive recipient name and gift preferences
3. Option to print reference card
4. "Look up another person" functionality

## 🚨 **Known Issues & Considerations**

### **Current Limitations**
- **All UI logic in single App.tsx file** (needs component extraction)
- **No input validation** for participant names in lookup
- **Browser dependency** for file downloads (won't work in all contexts)
- **No assignment preview** for organizers before encryption

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

### **Setup**
```bash
npm install
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
```

### **Deployment**
- **Auto-deployment** via GitHub Actions on push to main
- **Base path**: `/secret-santa/` for GitHub Pages
- **Build output**: `dist/` directory

### **Testing Strategy**
- Use `example-participants.csv` for testing
- Check console logs for CSV parsing debugging
- Test both admin and participant flows
- Verify file download functionality across browsers

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

1. **`src/App.tsx`** - Main application logic (550+ lines, needs refactoring)
2. **`src/utils/encryption.ts`** - Core encryption functionality
3. **`src/utils/csvParser.ts`** - Assignment generation algorithm
4. **`src/utils/fileUtils.ts`** - File handling and downloads
5. **`vite.config.ts`** - Build configuration for GitHub Pages

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

### **Encryption Process**
1. CSV → Participant objects
2. Generate assignments with conflict avoidance
3. Serialize to JSON
4. Encrypt with AES-GCM + random passphrase
5. Wrap in file format with metadata
6. Download as `.enc` file

## 🎄 **Theme & Styling Notes**

- **Christmas-specific branding** (not generic "holiday")
- **Emoji usage**: 🎅 🎄 🎁 for visual hierarchy
- **Print styles**: Optimized for reference cards
- **Responsive breakpoints**: 768px (tablet), 480px (mobile)
- **Accessibility**: Color contrast compliant, keyboard navigation

## ⚠️ **Critical Dependencies**

- **Web Crypto API**: Required for encryption (modern browsers only)
- **File API**: Required for CSV uploads and encrypted file downloads
- **localStorage**: Used for backup storage (graceful degradation)

## 🚀 **Deployment Checklist**

1. Update `vite.config.ts` base path if repo name changes
2. Replace `public/secret-santa-data.enc` with real data after first deployment
3. Verify GitHub Pages is enabled in repository settings
4. Test file download functionality in target browsers
5. Confirm mobile experience on actual devices

This codebase successfully solves a unique problem (stateful app on static hosting) with a clean, working solution that just needs better organization and component extraction for maintainability.

## 🤖 **AI Development Notes**

- **Framework match**: Uses same React+Vite stack as austinorth.com
- **Design constraints**: Minimalist + Christmas theme specifically requested
- **Privacy requirement**: Organizer must not see actual assignments
- **Hosting constraint**: Must work on GitHub Pages (static only)
- **User experience**: All error messages use proper error instances for better debugging