// CSV parsing utilities for Secret Santa participant data
// Handles parsing of CSV files with NAME, BIO, SO columns
// Also handles individual assignment format (v2.0)

export interface Participant {
  name: string;
  bio: string;
  significantOther: string;
}

export interface SecretSantaAssignment {
  giver: string;
  recipient: string;
  recipientBio: string;
}

// Parse CSV content into participant objects
export function parseCSV(csvContent: string): Participant[] {
  const lines = csvContent.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  // Validate required columns
  const requiredColumns = ["name", "bio", "so"];
  const missingColumns = requiredColumns.filter(
    (col) => !headers.includes(col),
  );

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
  }

  const nameIndex = headers.indexOf("name");
  const bioIndex = headers.indexOf("bio");
  const soIndex = headers.indexOf("so");

  const participants: Participant[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);

    if (values.length < Math.max(nameIndex, bioIndex, soIndex) + 1) {
      throw new Error(
        `Line ${i + 1} has insufficient columns. Expected ${Math.max(nameIndex, bioIndex, soIndex) + 1} columns but found ${values.length}. Make sure all rows have NAME, BIO, and SO columns.`,
      );
    }

    const participant: Participant = {
      name: values[nameIndex] ? values[nameIndex].trim() : "",
      bio: values[bioIndex] ? values[bioIndex].trim() : "",
      significantOther: values[soIndex] ? values[soIndex].trim() : "",
    };

    if (!participant.name) {
      throw new Error(
        `Line ${i + 1} has empty name field. Each participant must have a name.`,
      );
    }

    // Log the parsed participant for debugging
    console.log(
      `Parsed participant ${i}: Name="${participant.name}", Bio="${participant.bio.substring(0, 50)}...", SO="${participant.significantOther}"`,
    );

    participants.push(participant);
  }

  return participants;
}

// Parse a single CSV line, handling quoted values and commas within quotes
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  values.push(current.trim());

  // Ensure we have at least 3 columns (pad with empty strings if needed)
  while (values.length < 3) {
    values.push("");
  }

  return values;
}

// Generate Secret Santa assignments avoiding significant others
export function generateSecretSantaAssignments(
  participants: Participant[],
): SecretSantaAssignment[] {
  if (participants.length < 2) {
    throw new Error("Need at least 2 participants for Secret Santa");
  }

  // Create a map of significant others for quick lookup
  const soMap = new Map<string, string>();
  participants.forEach((p) => {
    if (p.significantOther) {
      soMap.set(p.name.toLowerCase(), p.significantOther.toLowerCase());
    }
  });

  // Function to check if two people are significant others
  const areSignificantOthers = (name1: string, name2: string): boolean => {
    const name1Lower = name1.toLowerCase();
    const name2Lower = name2.toLowerCase();
    return (
      soMap.get(name1Lower) === name2Lower ||
      soMap.get(name2Lower) === name1Lower
    );
  };

  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const assignments = generateValidAssignment(
        participants,
        areSignificantOthers,
      );
      return assignments;
    } catch (error) {
      // Log the specific error for debugging but continue trying
      console.log(
        `Assignment attempt ${attempts} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      continue;
    }
  }

  throw new Error(
    "Could not generate valid Secret Santa assignments after maximum attempts. Check for conflicts in significant other relationships.",
  );
}

// Generate a single valid assignment attempt
function generateValidAssignment(
  participants: Participant[],
  areSignificantOthers: (name1: string, name2: string) => boolean,
): SecretSantaAssignment[] {
  const givers = [...participants];
  const recipients = [...participants];

  // Shuffle recipients
  for (let i = recipients.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [recipients[i], recipients[j]] = [recipients[j], recipients[i]];
  }

  const assignments: SecretSantaAssignment[] = [];

  for (let i = 0; i < givers.length; i++) {
    const giver = givers[i];
    const recipient = recipients[i];

    // Check if this assignment is valid
    if (giver.name === recipient.name) {
      throw new Error("Person cannot be their own Secret Santa");
    }

    if (areSignificantOthers(giver.name, recipient.name)) {
      throw new Error("Significant others cannot be assigned to each other");
    }

    assignments.push({
      giver: giver.name,
      recipient: recipient.name,
      recipientBio: recipient.bio,
    });
  }

  return assignments;
}

// Convert assignments to encrypted data format
export function assignmentsToEncryptedFormat(
  assignments: SecretSantaAssignment[],
): string {
  return JSON.stringify(assignments, null, 2);
}

// Parse individual assignment data (v2.0 format)
export function parseIndividualAssignment(data: string): SecretSantaAssignment {
  try {
    const assignment = JSON.parse(data);

    // Validate the structure
    if (
      !assignment.giver ||
      !assignment.recipient ||
      assignment.recipientBio === undefined
    ) {
      throw new Error("Invalid assignment format: missing required fields");
    }

    return assignment as SecretSantaAssignment;
  } catch (error) {
    throw new Error(
      "Failed to parse individual assignment: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}
