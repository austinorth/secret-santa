// Encryption utilities for Secret Santa data with individual passphrase support
// Uses Web Crypto API with AES-GCM for secure encryption

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

// Derive a key from a passphrase using PBKDF2
async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

// Generate a random salt
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// Generate a random IV
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

// Hash a passphrase to create a lookup key
export async function hashPassphrase(passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Encrypt data with a passphrase
export async function encryptData(
  data: string,
  passphrase: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(passphrase, salt);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    encoder.encode(data),
  );

  // Combine salt, iv, and encrypted data
  const combined = new Uint8Array(
    salt.length + iv.length + encrypted.byteLength,
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

// Decrypt data with a passphrase
export async function decryptData(
  encryptedData: string,
  passphrase: string,
): Promise<string> {
  try {
    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedData)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 16 + IV_LENGTH);
    const encrypted = combined.slice(16 + IV_LENGTH);

    const key = await deriveKey(passphrase, salt);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      encrypted,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to decrypt data. Check your passphrase. Details: ${errorMessage}`,
    );
  }
}

// Find and decrypt individual assignment using passphrase
export async function findAndDecryptAssignment(
  encryptedAssignments: Record<string, string>,
  passphrase: string,
): Promise<string | null> {
  try {
    // Hash the passphrase to find the matching assignment
    const passphraseHash = await hashPassphrase(passphrase);

    // Find the encrypted assignment for this passphrase
    const encryptedAssignment = encryptedAssignments[passphraseHash];

    if (!encryptedAssignment) {
      return null; // No assignment found for this passphrase
    }

    // Decrypt the assignment
    const decryptedAssignment = await decryptData(
      encryptedAssignment,
      passphrase,
    );
    return decryptedAssignment;
  } catch (error) {
    throw new Error(
      `Failed to decrypt assignment: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Legacy function for backward compatibility with old format (v1.0)
export async function decryptLegacyData(
  encryptedData: string,
  passphrase: string,
): Promise<string> {
  return decryptData(encryptedData, passphrase);
}
