import { useState, useEffect } from "react";
import {
  encryptData,
  decryptData,
  generatePassphrase,
} from "./utils/encryption";
import {
  parseCSV,
  generateSecretSantaAssignments,
  assignmentsToEncryptedFormat,
  parseEncryptedFormat,
  SecretSantaAssignment,
} from "./utils/csvParser";
import {
  downloadEncryptedFile,
  readCSVFile,
  readUploadedFile,
  isValidCSVFile,
  isValidEncryptedFile,
  downloadCSVTemplate,
  loadExistingSecretSantaData,
  saveToLocalStorage,
  loadFromLocalStorage,
} from "./utils/fileUtils";
import "./App.css";

interface AppState {
  mode: "lookup" | "admin";
  assignments: SecretSantaAssignment[];
  passphrase: string;
  isDataLoaded: boolean;
  loading: boolean;
  error: string;
  success: string;
}

function App() {
  const [state, setState] = useState<AppState>({
    mode: "lookup",
    assignments: [],
    passphrase: "",
    isDataLoaded: false,
    loading: false,
    error: "",
    success: "",
  });

  const [lookupName, setLookupName] = useState("");
  const [currentAssignment, setCurrentAssignment] =
    useState<SecretSantaAssignment | null>(null);
  const [generatedFileData, setGeneratedFileData] = useState<{
    encryptedData: string;
    passphrase: string;
  } | null>(null);

  // Try to load existing data on component mount
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: "", success: "" }));

    try {
      // First try to load from public directory (GitHub Pages)
      let encryptedData = await loadExistingSecretSantaData();

      // If not found, try localStorage as backup
      if (!encryptedData) {
        encryptedData = loadFromLocalStorage("secret-santa-encrypted");
      }

      if (encryptedData) {
        // We have data but need the passphrase to decrypt it
        const savedPassphrase = loadFromLocalStorage("secret-santa-passphrase");
        if (savedPassphrase) {
          try {
            const decryptedData = await decryptData(
              encryptedData,
              savedPassphrase,
            );
            const assignments = parseEncryptedFormat(decryptedData);
            setState((prev) => ({
              ...prev,
              assignments,
              passphrase: savedPassphrase,
              isDataLoaded: true,
              loading: false,
              success: "Secret Santa data loaded successfully!",
            }));
          } catch (error) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error:
                "Found encrypted data but could not decrypt it: " +
                (error instanceof Error ? error.message : String(error)),
            }));
          }
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              "Found encrypted data but missing passphrase. Please upload the data file to continue.",
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            "No Secret Santa data found. Please use the admin panel to create assignments.",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          "Error loading Secret Santa data: " +
          (error instanceof Error ? error.message : String(error)),
      }));
    }
  };

  const handleCSVUpload = async (file: File) => {
    if (!isValidCSVFile(file)) {
      setState((prev) => ({
        ...prev,
        error: "Please upload a valid CSV file",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: "", success: "" }));

    try {
      const csvContent = await readCSVFile(file);
      const participants = parseCSV(csvContent);
      const assignments = generateSecretSantaAssignments(participants);

      // Generate a new passphrase
      const newPassphrase = generatePassphrase();

      // Encrypt the assignments
      const dataToEncrypt = assignmentsToEncryptedFormat(assignments);
      const encryptedData = await encryptData(dataToEncrypt, newPassphrase);

      // Save to localStorage as backup
      saveToLocalStorage("secret-santa-encrypted", encryptedData);
      saveToLocalStorage("secret-santa-passphrase", newPassphrase);

      // Store generated data for download
      setGeneratedFileData({ encryptedData, passphrase: newPassphrase });

      setState((prev) => ({
        ...prev,
        assignments,
        passphrase: newPassphrase,
        isDataLoaded: true,
        loading: false,
        success: `Secret Santa assignments generated successfully! Use the download button below to save the encrypted file.`,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          "Error processing CSV: " +
          (error instanceof Error ? error.message : String(error)),
      }));
    }
  };

  const handleEncryptedFileUpload = async (file: File) => {
    if (!isValidEncryptedFile(file)) {
      setState((prev) => ({
        ...prev,
        error: "Please upload a valid encrypted data file",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: "", success: "" }));

    try {
      const encryptedData = await readUploadedFile(file);

      // Try to decrypt with the current passphrase
      if (state.passphrase) {
        try {
          const decryptedData = await decryptData(
            encryptedData,
            state.passphrase,
          );
          const assignments = parseEncryptedFormat(decryptedData);

          // Save to localStorage
          saveToLocalStorage("secret-santa-encrypted", encryptedData);

          setState((prev) => ({
            ...prev,
            assignments,
            isDataLoaded: true,
            loading: false,
            success: "Secret Santa data loaded successfully!",
          }));
        } catch (error) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              "Could not decrypt file with current passphrase: " +
              (error instanceof Error ? error.message : String(error)),
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            "Please enter the passphrase first, then upload the file again.",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          "Error reading file: " +
          (error instanceof Error ? error.message : String(error)),
      }));
    }
  };

  const handleNameLookup = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setCurrentAssignment(null);
      return;
    }

    const assignment = state.assignments.find(
      (a) => a.giver.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (assignment) {
      setCurrentAssignment(assignment);
      setState((prev) => ({ ...prev, error: "", success: "" }));
    } else {
      setCurrentAssignment(null);
      setState((prev) => ({
        ...prev,
        error: "Name not found in Secret Santa list",
      }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const clearData = () => {
    setState({
      mode: "lookup",
      assignments: [],
      passphrase: "",
      isDataLoaded: false,
      loading: false,
      error: "",
      success: "",
    });
    setLookupName("");
    setCurrentAssignment(null);
    setGeneratedFileData(null);
    saveToLocalStorage("secret-santa-encrypted", "");
    saveToLocalStorage("secret-santa-passphrase", "");
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🎅 Secret Santa</h1>
        <p className="subtitle">Discover your Christmas gift recipient</p>
      </div>

      {state.loading && (
        <div className="card">
          <p className="text-center">Loading...</p>
        </div>
      )}

      {state.error && <div className="alert alert-error">{state.error}</div>}

      {state.success && (
        <div className="alert alert-success">{state.success}</div>
      )}

      {state.mode === "lookup" && (
        <div className="card">
          <h2>Find Your Secret Santa Assignment</h2>

          {!state.isDataLoaded && (
            <div className="alert alert-error">
              <h4>🎄 Getting Started</h4>
              <p>
                No Secret Santa data is currently loaded. Here's what you need
                to do:
              </p>
              <ol style={{ textAlign: "left", marginLeft: "1rem" }}>
                <li>
                  <strong>Organizers:</strong> Use the admin panel below to
                  upload a CSV file and generate assignments
                </li>
                <li>
                  <strong>Participants:</strong> Contact your organizer to
                  ensure the Secret Santa data has been set up
                </li>
              </ol>
              <p>
                Once the data is loaded, you'll be able to enter your name and
                discover your gift recipient!
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name-input">Enter your name:</label>
            <input
              id="name-input"
              type="text"
              className="form-control"
              value={lookupName}
              onChange={(e) => setLookupName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleNameLookup(lookupName);
                }
              }}
              placeholder={
                state.isDataLoaded ? "Your full name" : "Data not loaded yet..."
              }
              disabled={!state.isDataLoaded}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleNameLookup(lookupName)}
            disabled={!state.isDataLoaded || !lookupName.trim()}
          >
            🎁 Find My Assignment
          </button>

          {currentAssignment && (
            <div className="gift-info">
              <h3>🎁 Your Secret Santa Assignment</h3>
              <div className="recipient-name">
                {currentAssignment.recipient}
              </div>
              <div className="bio">{currentAssignment.recipientBio}</div>
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <button className="btn btn-outline" onClick={handlePrint}>
                  🖨️ Print This Page
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setCurrentAssignment(null);
                    setLookupName("");
                  }}
                  style={{ marginLeft: "1rem" }}
                >
                  🔍 Look Up Another Person
                </button>
              </div>
            </div>
          )}

          {state.isDataLoaded && (
            <div
              style={{
                marginTop: "2rem",
                padding: "1rem",
                backgroundColor: "var(--warm-cream)",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--soft-gray)",
                }}
              >
                ✅ Secret Santa data loaded with {state.assignments.length}{" "}
                participants
              </p>
            </div>
          )}
        </div>
      )}

      <div className="admin-section">
        <div className="text-center mb-3">
          <button
            className="btn btn-outline"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                mode: prev.mode === "admin" ? "lookup" : "admin",
                error: "",
                success: "",
              }))
            }
          >
            {state.mode === "admin"
              ? "👤 Switch to Participant Lookup"
              : "⚙️ Organizer Admin Panel"}
          </button>
        </div>

        {state.mode === "admin" && (
          <div className="card">
            <h2>🎅 Organizer Admin Panel</h2>

            <div
              className="alert"
              style={{
                backgroundColor: "rgba(255, 193, 7, 0.1)",
                border: "1px solid var(--gold)",
                color: "var(--text-dark)",
              }}
            >
              <h4>📋 Setup Instructions</h4>
              <ol
                style={{
                  textAlign: "left",
                  marginLeft: "1rem",
                  marginBottom: 0,
                }}
              >
                <li>
                  Download the CSV template and fill it with participant data
                </li>
                <li>
                  Upload the completed CSV to generate encrypted assignments
                </li>
                <li>Save the generated file and passphrase</li>
                <li>Add the encrypted file to your GitHub repo and deploy</li>
              </ol>
            </div>

            <div className="form-group">
              <label>Step 1: Upload CSV File (NAME, BIO, SO)</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCSVUpload(file);
                  }}
                />
                <p>
                  📤 Upload a CSV file to generate new Secret Santa assignments
                </p>
                <button
                  className="btn btn-outline mt-1"
                  onClick={downloadCSVTemplate}
                >
                  📄 Download CSV Template
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="passphrase-input">
                Step 2: Passphrase (for loading existing data)
              </label>
              <input
                id="passphrase-input"
                type="text"
                className="form-control"
                value={state.passphrase}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, passphrase: e.target.value }))
                }
                placeholder="Enter passphrase to decrypt existing data"
              />
            </div>

            <div className="form-group">
              <label>Step 3: Upload Encrypted Data File</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept=".enc,.json,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleEncryptedFileUpload(file);
                  }}
                />
                <p>📁 Upload the encrypted Secret Santa data file</p>
              </div>
            </div>

            {state.isDataLoaded && (
              <div className="form-group">
                <div className="alert alert-success">
                  <h3>✅ Current Data Status</h3>
                  <p>
                    <strong>Participants:</strong> {state.assignments.length}{" "}
                    people loaded
                  </p>
                  <p>
                    <strong>Passphrase:</strong>{" "}
                    <code
                      style={{
                        backgroundColor: "rgba(255,255,255,0.3)",
                        padding: "0.2rem 0.4rem",
                        borderRadius: "4px",
                      }}
                    >
                      {state.passphrase}
                    </code>
                  </p>
                  <p style={{ marginBottom: 0 }}>
                    <strong>Status:</strong> Ready for participant lookup! 🎉
                  </p>
                </div>
                <button className="btn btn-secondary" onClick={clearData}>
                  🗑️ Clear All Data
                </button>
              </div>
            )}

            {generatedFileData && (
              <div className="form-group">
                <div
                  className="alert"
                  style={{
                    backgroundColor: "rgba(255, 193, 7, 0.1)",
                    border: "1px solid var(--gold)",
                    color: "var(--text-dark)",
                  }}
                >
                  <h3>📥 Download Required</h3>
                  <p>
                    Your encrypted Secret Santa data has been generated! You
                    must download this file and add it to your GitHub
                    repository.
                  </p>
                  <p>
                    <strong>Passphrase:</strong>{" "}
                    <code
                      style={{
                        backgroundColor: "rgba(255,255,255,0.5)",
                        padding: "0.2rem 0.4rem",
                        borderRadius: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      {generatedFileData.passphrase}
                    </code>
                  </p>
                  <p style={{ marginBottom: "1rem" }}>
                    <small>
                      ⚠️ Save this passphrase! You'll need it to decrypt the
                      data.
                    </small>
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      downloadEncryptedFile(generatedFileData.encryptedData);
                      setState((prev) => ({
                        ...prev,
                        success:
                          "File downloaded! Replace 'public/secret-santa-data.enc' in your repo with this file.",
                      }));
                    }}
                    style={{ marginRight: "1rem" }}
                  >
                    📥 Download Encrypted File
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setGeneratedFileData(null)}
                  >
                    ✅ Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="footer">
        <p>
          🎄 Merry Christmas! Keep your assignment secret until gift exchange
          day! 🎁
        </p>
      </div>
    </div>
  );
}

export default App;
