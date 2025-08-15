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
  csvUploadStatus: string;
  fileUploadStatus: string;
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
    csvUploadStatus: "",
    fileUploadStatus: "",
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
    setState((prev) => ({
      ...prev,
      loading: true,
      error: "",
      success: "",
      csvUploadStatus: "",
      fileUploadStatus: "",
    }));

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

    setState((prev) => ({
      ...prev,
      loading: true,
      csvUploadStatus: "Processing CSV file...",
      error: "",
      success: "",
    }));

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
        csvUploadStatus: `✅ Success! Generated assignments for ${assignments.length} participants.`,
        success: "",
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        csvUploadStatus: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        error: "",
      }));
    }
  };

  const handleEncryptedFileUpload = async (file: File) => {
    if (!isValidEncryptedFile(file)) {
      setState((prev) => ({
        ...prev,
        fileUploadStatus:
          "❌ Please upload a valid encrypted data file (.enc, .json, .txt)",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      fileUploadStatus: "🔄 Reading and decrypting file...",
      error: "",
      success: "",
    }));

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
            fileUploadStatus: `✅ File loaded successfully! ${assignments.length} participants ready.`,
            success: "",
          }));
        } catch (error) {
          setState((prev) => ({
            ...prev,
            loading: false,
            fileUploadStatus: `❌ Decryption failed: ${error instanceof Error ? error.message : String(error)}`,
            error: "",
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          fileUploadStatus:
            "❌ Please enter the passphrase first, then upload the file again.",
          error: "",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        fileUploadStatus: `❌ File read error: ${error instanceof Error ? error.message : String(error)}`,
        error: "",
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
      csvUploadStatus: "",
      fileUploadStatus: "",
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
        <h1>🎅 Blake Family Secret Santa</h1>
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
                csvUploadStatus: "",
                fileUploadStatus: "",
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

            {/* Step 1: CSV Upload */}
            <div className="form-group">
              <h3
                style={{ color: "var(--holly-green)", marginBottom: "0.5rem" }}
              >
                Step 1: Create Secret Santa Assignments
              </h3>
              <p style={{ color: "var(--soft-gray)", marginBottom: "1rem" }}>
                Upload a CSV file with participant data to generate encrypted
                assignments
              </p>

              <div style={{ marginBottom: "1rem" }}>
                <button
                  className="btn btn-outline"
                  onClick={downloadCSVTemplate}
                  style={{ marginBottom: "1rem" }}
                >
                  📄 Download CSV Template
                </button>
              </div>

              <div className="file-upload-area">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setState((prev) => ({ ...prev, csvUploadStatus: "" }));
                      handleCSVUpload(file);
                    }
                  }}
                />
                <p>📤 Choose CSV file (NAME, BIO, SO columns required)</p>
              </div>

              {state.csvUploadStatus && (
                <div
                  className={`alert ${state.csvUploadStatus.includes("❌") ? "alert-error" : "alert-success"}`}
                  style={{ marginTop: "1rem" }}
                >
                  {state.csvUploadStatus}
                </div>
              )}
            </div>

            {/* Step 2: Load Existing Data */}
            <div
              className="form-group"
              style={{
                borderTop: "1px solid var(--silver)",
                paddingTop: "2rem",
              }}
            >
              <h3
                style={{ color: "var(--holly-green)", marginBottom: "0.5rem" }}
              >
                Step 2: Load Existing Data (Optional)
              </h3>
              <p style={{ color: "var(--soft-gray)", marginBottom: "1rem" }}>
                If you have previously generated Secret Santa data, load it here
              </p>

              <div className="form-group">
                <label htmlFor="passphrase-input">Passphrase:</label>
                <input
                  id="passphrase-input"
                  type="text"
                  className="form-control"
                  value={state.passphrase}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      passphrase: e.target.value,
                      fileUploadStatus: "",
                    }))
                  }
                  placeholder="Enter the passphrase from when you generated the data"
                />
              </div>

              <div className="file-upload-area">
                <input
                  type="file"
                  accept=".enc,.json,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setState((prev) => ({ ...prev, fileUploadStatus: "" }));
                      handleEncryptedFileUpload(file);
                    }
                  }}
                />
                <p>📁 Choose your encrypted Secret Santa data file</p>
              </div>

              {state.fileUploadStatus && (
                <div
                  className={`alert ${state.fileUploadStatus.includes("❌") ? "alert-error" : "alert-success"}`}
                  style={{ marginTop: "1rem" }}
                >
                  {state.fileUploadStatus}
                </div>
              )}
            </div>

            {/* Current Status */}
            {state.isDataLoaded && (
              <div
                className="form-group"
                style={{
                  borderTop: "1px solid var(--silver)",
                  paddingTop: "2rem",
                }}
              >
                <div className="alert alert-success">
                  <h3 style={{ margin: "0 0 1rem 0" }}>✅ System Ready!</h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <p style={{ margin: "0 0 0.5rem 0" }}>
                        <strong>{state.assignments.length} participants</strong>{" "}
                        loaded and ready for lookup
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--soft-gray)",
                        }}
                      >
                        Participants can now use the lookup feature to find
                        their assignments
                      </p>
                    </div>
                    <button className="btn btn-secondary" onClick={clearData}>
                      🗑️ Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Download Section */}
            {generatedFileData && (
              <div
                className="form-group"
                style={{
                  borderTop: "1px solid var(--silver)",
                  paddingTop: "2rem",
                }}
              >
                <div
                  className="alert"
                  style={{
                    backgroundColor: "rgba(255, 193, 7, 0.1)",
                    border: "2px solid var(--gold)",
                    color: "var(--text-dark)",
                  }}
                >
                  <h3
                    style={{
                      color: "var(--holly-green)",
                      marginBottom: "1rem",
                    }}
                  >
                    🎉 Ready to Download!
                  </h3>
                  <p style={{ marginBottom: "1rem" }}>
                    Your encrypted Secret Santa data has been generated!
                    Download this file and replace
                    <code
                      style={{
                        background: "rgba(0,0,0,0.1)",
                        padding: "2px 4px",
                        margin: "0 4px",
                      }}
                    >
                      public/secret-santa-data.enc
                    </code>
                    in your GitHub repository.
                  </p>

                  <div
                    style={{
                      background: "rgba(15, 81, 50, 0.1)",
                      padding: "1rem",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                    }}
                  >
                    <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
                      🔑 Your Passphrase:
                    </p>
                    <code
                      style={{
                        backgroundColor: "var(--snow-white)",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        display: "block",
                        border: "1px solid var(--holly-green)",
                      }}
                    >
                      {generatedFileData.passphrase}
                    </code>
                    <small
                      style={{
                        color: "var(--soft-gray)",
                        marginTop: "0.5rem",
                        display: "block",
                      }}
                    >
                      ⚠️ Save this passphrase somewhere safe! You'll need it to
                      load the data later.
                    </small>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        downloadEncryptedFile(generatedFileData.encryptedData);
                        setState((prev) => ({
                          ...prev,
                          success:
                            "File downloaded! Don't forget to commit it to your repository.",
                        }));
                      }}
                      style={{
                        marginRight: "1rem",
                        fontSize: "1.1rem",
                        padding: "0.75rem 1.5rem",
                      }}
                    >
                      📥 Download secret-santa-data.enc
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setGeneratedFileData(null)}
                    >
                      ✅ Done
                    </button>
                  </div>
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
