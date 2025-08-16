// File utilities for handling encrypted Secret Santa data
// Handles file downloads, uploads, and local storage operations

export interface EncryptedFileData {
  data: string;
  timestamp: number;
  version: string;
}

export interface EncryptedFileDataV2 {
  assignments: Record<string, string>;
  timestamp: number;
  version: string;
}

// Download encrypted data as a file
export function downloadEncryptedFile(
  encryptedData: string,
  filename: string = "secret-santa-data.enc",
): void {
  try {
    const fileData: EncryptedFileData = {
      data: encryptedData,
      timestamp: Date.now(),
      version: "1.0",
    };

    const jsonString = JSON.stringify(fileData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();

    // Clean up after a short delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    console.log(`Download initiated for file: ${filename}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to download file:", errorMessage);
    throw new Error(`Failed to download encrypted file: ${errorMessage}`);
  }
}

// Read file content from uploaded file
export function readUploadedFile(
  file: File,
): Promise<EncryptedFileData | EncryptedFileDataV2> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        // Validate it's a proper JSON file
        const parsed = JSON.parse(content);

        // Check for v2.0 format (individual assignments)
        if (parsed.assignments && parsed.timestamp && parsed.version) {
          resolve(parsed as EncryptedFileDataV2);
        }
        // Check for v1.0 format (legacy single passphrase)
        else if (parsed.data && parsed.timestamp && parsed.version) {
          resolve(parsed as EncryptedFileData);
        } else {
          reject(new Error("Invalid file format: missing required fields"));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        reject(new Error(`Invalid file format: ${errorMessage}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

// Read CSV file content
export function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read CSV file"));
    };

    reader.readAsText(file);
  });
}

// Validate file type for CSV uploads
export function isValidCSVFile(file: File): boolean {
  const validTypes = ["text/csv", "application/csv", "text/plain"];
  const validExtensions = [".csv", ".txt"];

  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );

  return hasValidType || hasValidExtension;
}

// Validate file type for encrypted data uploads
export function isValidEncryptedFile(file: File): boolean {
  const validTypes = ["application/json", "text/plain"];
  const validExtensions = [".enc", ".json", ".txt"];

  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );

  return hasValidType || hasValidExtension;
}

// Generate a CSV template for download
export function downloadCSVTemplate(): void {
  const template = `NAME,BIO,SO
John Doe,"Loves coffee and hiking. Gift ideas: coffee beans, hiking gear, books",Jane Doe
Jane Doe,"Enjoys cooking and yoga. Gift ideas: cooking utensils, tea sets, plants",John Doe
Alice Smith,"Photography enthusiast. Gift ideas: camera accessories, art supplies",
Bob Johnson,"Tech lover and gamer. Gift ideas: gadgets, games, tech books",
Charlie Wilson,"Musician and reader. Gift ideas: music gear, books, vinyl records",`;

  const blob = new Blob([template], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "secret-santa-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Check if we're running on GitHub Pages and try to load existing data
export async function loadExistingSecretSantaData(): Promise<
  EncryptedFileData | EncryptedFileDataV2 | null
> {
  try {
    // Try to load from the public directory (for GitHub Pages deployment)
    const response = await fetch("./secret-santa-data.enc");

    if (response.ok) {
      const content = await response.text();
      // Validate it's proper format
      const parsed = JSON.parse(content);

      // Check for v2.0 format (individual assignments)
      if (parsed.assignments && parsed.timestamp && parsed.version) {
        return parsed as EncryptedFileDataV2;
      }

      // Check for v1.0 format (legacy single passphrase)
      if (parsed.data && parsed.timestamp && parsed.version) {
        return parsed as EncryptedFileData;
      }
    }
  } catch (error) {
    // File doesn't exist or is invalid, which is fine for first run
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(
      `No existing Secret Santa data found (${errorMessage}), which is expected for first run`,
    );
  }

  return null;
}

// Save data to localStorage as backup
export function saveToLocalStorage(key: string, data: string): void {
  try {
    localStorage.setItem(key, data);
  } catch (error) {
    console.warn("Could not save to localStorage:", error);
  }
}

// Load data from localStorage
export function loadFromLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("Could not load from localStorage:", error);
    return null;
  }
}

// Clear localStorage data
export function clearLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Could not clear localStorage:", error);
  }
}
