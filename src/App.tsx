import { useState, useEffect } from "react";
import {
  decryptLegacyData,
  findAndDecryptAssignment,
} from "./utils/encryption";
import {
  parseEncryptedFormat,
  parseIndividualAssignment,
  SecretSantaAssignment,
} from "./utils/csvParser";
import {
  loadExistingSecretSantaData,
  EncryptedFileData,
  EncryptedFileDataV2,
} from "./utils/fileUtils";
import "./App.css";

interface AppState {
  assignment: SecretSantaAssignment | null;
  isDataLoaded: boolean;
  loading: boolean;
  error: string;
  success: string;
  dataVersion: string;
}

function App() {
  const [state, setState] = useState<AppState>({
    assignment: null,
    isDataLoaded: false,
    loading: false,
    error: "",
    success: "",
    dataVersion: "unknown",
  });

  const [passphraseInput, setPassphraseInput] = useState("");
  const [needsPassphrase, setNeedsPassphrase] = useState(false);
  const [encryptedData, setEncryptedData] = useState<
    EncryptedFileData | EncryptedFileDataV2 | null
  >(null);

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
    }));

    try {
      // Load encrypted data from public directory (GitHub Pages)
      const data = await loadExistingSecretSantaData();

      if (data) {
        setEncryptedData(data);
        setNeedsPassphrase(true);

        const version = data.version || "1.0";
        const isV2 = version === "2.0";

        setState((prev) => ({
          ...prev,
          loading: false,
          dataVersion: version,
          success: isV2
            ? "Secret Santa data found! Enter your personal passphrase to see your assignment."
            : "Secret Santa data found! Please enter the shared passphrase to access assignments.",
        }));
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            "No Secret Santa data found. Contact your organizer to set up the assignments.",
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: `Failed to load Secret Santa data: ${errorMessage}`,
      }));
    }
  };

  const handlePassphraseSubmit = async () => {
    if (!passphraseInput.trim()) {
      setState((prev) => ({
        ...prev,
        error: "Please enter a passphrase",
      }));
      return;
    }

    if (!encryptedData) {
      setState((prev) => ({
        ...prev,
        error: "No encrypted data available",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const version = encryptedData.version || "1.0";

      if (version === "2.0") {
        // Handle v2.0 format (individual passphrases)
        const v2Data = encryptedData as EncryptedFileDataV2;
        const decryptedAssignmentData = await findAndDecryptAssignment(
          v2Data.assignments,
          passphraseInput,
        );

        if (!decryptedAssignmentData) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              "No assignment found for this passphrase. Please check your passphrase or contact your organizer.",
          }));
          return;
        }

        const assignment = parseIndividualAssignment(decryptedAssignmentData);

        setState((prev) => ({
          ...prev,
          assignment,
          isDataLoaded: true,
          loading: false,
          success: `Welcome ${assignment.giver}! Here's your Secret Santa assignment.`,
        }));

        setNeedsPassphrase(false);
      } else {
        // Handle v1.0 format (legacy shared passphrase)
        const v1Data = encryptedData as EncryptedFileData;
        const decryptedData = await decryptLegacyData(
          v1Data.data,
          passphraseInput,
        );
        const assignments = parseEncryptedFormat(decryptedData);

        // For legacy mode, we still need to ask for a name
        setState((prev) => ({
          ...prev,
          // Store assignments temporarily for legacy lookup
          loading: false,
          success:
            "Secret Santa data loaded successfully! Now enter your name to find your assignment.",
          dataVersion: "1.0-legacy",
        }));

        // Store assignments in a way we can access them for legacy lookup
        (window as any).legacyAssignments = assignments;
        setNeedsPassphrase(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: `Failed to decrypt data: ${errorMessage}. Please check your passphrase.`,
      }));
    }
  };

  const handleLegacyLookup = (lookupName: string) => {
    const trimmedName = lookupName.trim();
    if (!trimmedName) {
      setState((prev) => ({
        ...prev,
        error: "Please enter a name to look up",
      }));
      return;
    }

    const assignments = (window as any)
      .legacyAssignments as SecretSantaAssignment[];
    if (!assignments) {
      setState((prev) => ({
        ...prev,
        error: "No assignment data available",
      }));
      return;
    }

    // Find assignment for this person
    const assignment = assignments.find(
      (a) => a.giver.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (assignment) {
      setState((prev) => ({
        ...prev,
        assignment,
        isDataLoaded: true,
        error: "",
        success: `Found assignment for ${assignment.giver}!`,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        error: `No assignment found for "${trimmedName}". Please check the spelling or contact your organizer.`,
        success: "",
      }));
    }
  };

  const handlePrint = () => {
    if (state.assignment) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Secret Santa Assignment - ${state.assignment.giver}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  max-width: 400px;
                  margin: 0 auto;
                  padding: 20px;
                  background: white;
                }
                .card {
                  border: 2px solid #0f5132;
                  border-radius: 10px;
                  padding: 20px;
                  text-align: center;
                  background: #f8f9fa;
                }
                .title {
                  color: #0f5132;
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 20px;
                }
                .recipient {
                  font-size: 20px;
                  font-weight: bold;
                  color: #dc3545;
                  margin: 15px 0;
                }
                .bio {
                  font-size: 14px;
                  line-height: 1.4;
                  margin-top: 15px;
                  text-align: left;
                }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="title">🎅 Secret Santa Assignment</div>
                <div><strong>For:</strong> ${state.assignment.giver}</div>
                <div class="recipient">🎁 ${state.assignment.recipient}</div>
                <div class="bio">
                  <strong>About them:</strong><br>
                  ${state.assignment.recipientBio || "No additional information provided"}
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const resetApp = () => {
    setState({
      assignment: null,
      isDataLoaded: false,
      loading: false,
      error: "",
      success: "",
      dataVersion: "unknown",
    });
    setPassphraseInput("");
    setNeedsPassphrase(false);
    setEncryptedData(null);
    // Clear legacy data
    delete (window as any).legacyAssignments;
  };

  const LegacyNameLookup = () => {
    const [lookupName, setLookupName] = useState("");

    return (
      <div className="card">
        <h2>👤 Enter your name</h2>
        <p>
          Enter your name exactly as it appears in the participant list to find
          your Secret Santa assignment.
        </p>
        <div className="input-group">
          <input
            type="text"
            value={lookupName}
            onChange={(e) => setLookupName(e.target.value)}
            placeholder="Enter your full name"
            onKeyPress={(e) =>
              e.key === "Enter" && handleLegacyLookup(lookupName)
            }
          />
          <button
            onClick={() => handleLegacyLookup(lookupName)}
            disabled={!lookupName.trim()}
          >
            🎁 Find My Assignment
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎄 Secret Santa Lookup</h1>
        <p>
          {state.dataVersion === "2.0"
            ? "Enter your personal passphrase to see your assignment"
            : "Find your Secret Santa assignment"}
        </p>
      </header>

      <main className="main">
        {/* Loading State */}
        {state.loading && (
          <div className="card">
            <div className="loading">
              <span>⏳ Loading Secret Santa data...</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="error-message">
            <span>❌ {state.error}</span>
          </div>
        )}

        {/* Success Display */}
        {state.success && !state.error && (
          <div className="success-message">
            <span>✅ {state.success}</span>
          </div>
        )}

        {/* Password Input */}
        {needsPassphrase && !state.isDataLoaded && (
          <div className="card">
            <h2>🔐 Enter Passphrase</h2>
            <p>
              {state.dataVersion === "2.0"
                ? "Your organizer should have provided you with a personal passphrase that only unlocks your assignment."
                : "Your organizer should have provided you with a passphrase to access the Secret Santa assignments."}
            </p>
            <div className="input-group">
              <input
                type="text"
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                placeholder={
                  state.dataVersion === "2.0"
                    ? "Enter your personal passphrase"
                    : "Enter shared passphrase"
                }
                onKeyPress={(e) =>
                  e.key === "Enter" && handlePassphraseSubmit()
                }
                disabled={state.loading}
              />
              <button
                onClick={handlePassphraseSubmit}
                disabled={state.loading || !passphraseInput.trim()}
              >
                🔓{" "}
                {state.dataVersion === "2.0"
                  ? "View My Assignment"
                  : "Unlock Assignments"}
              </button>
            </div>
          </div>
        )}

        {/* Legacy Name Lookup (v1.0 format) */}
        {state.dataVersion === "1.0-legacy" && !state.assignment && (
          <LegacyNameLookup />
        )}

        {/* Assignment Display */}
        {state.assignment && (
          <div className="card assignment-card">
            <h2>🎅 Your Secret Santa Assignment</h2>
            <div className="assignment-details">
              <div className="assignment-giver">
                <strong>Your name:</strong> {state.assignment.giver}
              </div>
              <div className="assignment-recipient">
                <strong>🎁 You're giving to:</strong>{" "}
                {state.assignment.recipient}
              </div>
              {state.assignment.recipientBio && (
                <div className="assignment-bio">
                  <strong>About them:</strong>
                  <p>{state.assignment.recipientBio}</p>
                </div>
              )}
            </div>
            <div className="assignment-actions">
              <button onClick={handlePrint} className="print-button">
                🖨️ Print Reference Card
              </button>
              {state.dataVersion !== "2.0" && (
                <button onClick={resetApp} className="secondary-button">
                  👥 Look up another person
                </button>
              )}
              {state.dataVersion === "2.0" && (
                <button onClick={resetApp} className="secondary-button">
                  🔄 Enter Different Passphrase
                </button>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!state.isDataLoaded && !needsPassphrase && !state.loading && (
          <div className="card">
            <h2>📝 Instructions</h2>
            <div className="instructions">
              <p>
                🎄 <strong>Welcome to Secret Santa!</strong>
              </p>
              <p>
                This app helps you find your Secret Santa assignment. Your
                organizer needs to:
              </p>
              <ol>
                <li>
                  Generate the encrypted assignment data using the provided
                  script
                </li>
                <li>Deploy the updated data to this website</li>
                <li>Share your personal passphrase with you</li>
              </ol>
              <p>
                Once that's done, you'll be able to enter your passphrase and
                see your assignment! Each person gets their own unique
                passphrase that only shows their assignment.
              </p>
            </div>
          </div>
        )}

        {/* Privacy Notice for v2.0 */}
        {state.dataVersion === "2.0" && state.assignment && (
          <div className="card">
            <h3>🔒 Privacy Notice</h3>
            <p>
              Your passphrase only unlocks your assignment. Other participants
              cannot see your assignment, and you cannot see theirs. This
              ensures maximum privacy for everyone!
            </p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>🎁 Keep your assignment secret until gift exchange day! 🤫</p>
        {state.dataVersion === "2.0" && (
          <p>🔐 Your passphrase is personal - don't share it with others!</p>
        )}
      </footer>
    </div>
  );
}

export default App;
