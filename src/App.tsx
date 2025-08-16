import { useState, useEffect } from "react";
import { decryptData } from "./utils/encryption";
import { parseEncryptedFormat, SecretSantaAssignment } from "./utils/csvParser";
import { loadExistingSecretSantaData } from "./utils/fileUtils";
import "./App.css";

interface AppState {
  assignments: SecretSantaAssignment[];
  passphrase: string;
  isDataLoaded: boolean;
  loading: boolean;
  error: string;
  success: string;
}

function App() {
  const [state, setState] = useState<AppState>({
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
  const [passphraseInput, setPassphraseInput] = useState("");
  const [needsPassphrase, setNeedsPassphrase] = useState(false);

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
      const encryptedData = await loadExistingSecretSantaData();

      if (encryptedData) {
        // We have data but need the passphrase to decrypt it
        setNeedsPassphrase(true);
        setState((prev) => ({
          ...prev,
          loading: false,
          success:
            "Secret Santa data found! Please enter the passphrase to access assignments.",
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

    setState((prev) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const encryptedData = await loadExistingSecretSantaData();
      if (!encryptedData) {
        throw new Error("No encrypted data found");
      }

      const decryptedData = await decryptData(encryptedData, passphraseInput);
      const assignments = parseEncryptedFormat(decryptedData);

      setState((prev) => ({
        ...prev,
        assignments,
        passphrase: passphraseInput,
        isDataLoaded: true,
        loading: false,
        success: "Secret Santa data loaded successfully!",
      }));

      setNeedsPassphrase(false);
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

  const handleLookup = () => {
    const trimmedName = lookupName.trim();
    if (!trimmedName) {
      setState((prev) => ({
        ...prev,
        error: "Please enter a name to look up",
      }));
      return;
    }

    // Find assignment for this person
    const assignment = state.assignments.find(
      (a) => a.giver.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (assignment) {
      setCurrentAssignment(assignment);
      setState((prev) => ({
        ...prev,
        error: "",
        success: `Found assignment for ${assignment.giver}!`,
      }));
    } else {
      setCurrentAssignment(null);
      setState((prev) => ({
        ...prev,
        error: `No assignment found for "${trimmedName}". Please check the spelling or contact your organizer.`,
        success: "",
      }));
    }
  };

  const handlePrint = () => {
    if (currentAssignment) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Secret Santa Assignment - ${currentAssignment.giver}</title>
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
                <div><strong>For:</strong> ${currentAssignment.giver}</div>
                <div class="recipient">🎁 ${currentAssignment.recipient}</div>
                <div class="bio">
                  <strong>About them:</strong><br>
                  ${currentAssignment.recipientBio || "No additional information provided"}
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

  const resetLookup = () => {
    setLookupName("");
    setCurrentAssignment(null);
    setState((prev) => ({
      ...prev,
      error: "",
      success: "",
    }));
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎄 Secret Santa Lookup</h1>
        <p>Find your Secret Santa assignment</p>
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

        {/* Passphrase Input */}
        {needsPassphrase && !state.isDataLoaded && (
          <div className="card">
            <h2>🔐 Enter Passphrase</h2>
            <p>
              Your organizer should have provided you with a passphrase to
              access the Secret Santa assignments.
            </p>
            <div className="input-group">
              <input
                type="text"
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                placeholder="Enter passphrase (e.g., snowflake-mistletoe-gift-123)"
                onKeyPress={(e) =>
                  e.key === "Enter" && handlePassphraseSubmit()
                }
                disabled={state.loading}
              />
              <button
                onClick={handlePassphraseSubmit}
                disabled={state.loading || !passphraseInput.trim()}
              >
                🔓 Unlock Assignments
              </button>
            </div>
          </div>
        )}

        {/* Participant Lookup */}
        {state.isDataLoaded && !currentAssignment && (
          <div className="card">
            <h2>👤 Look up your assignment</h2>
            <p>
              Enter your name exactly as it appears in the participant list to
              find your Secret Santa assignment.
            </p>
            <div className="input-group">
              <input
                type="text"
                value={lookupName}
                onChange={(e) => setLookupName(e.target.value)}
                placeholder="Enter your full name"
                onKeyPress={(e) => e.key === "Enter" && handleLookup()}
              />
              <button onClick={handleLookup} disabled={!lookupName.trim()}>
                🎁 Find My Assignment
              </button>
            </div>
            <div className="participant-count">
              {state.assignments.length} participants in this Secret Santa
            </div>
          </div>
        )}

        {/* Assignment Display */}
        {currentAssignment && (
          <div className="card assignment-card">
            <h2>🎅 Your Secret Santa Assignment</h2>
            <div className="assignment-details">
              <div className="assignment-giver">
                <strong>Your name:</strong> {currentAssignment.giver}
              </div>
              <div className="assignment-recipient">
                <strong>🎁 You're giving to:</strong>{" "}
                {currentAssignment.recipient}
              </div>
              {currentAssignment.recipientBio && (
                <div className="assignment-bio">
                  <strong>About them:</strong>
                  <p>{currentAssignment.recipientBio}</p>
                </div>
              )}
            </div>
            <div className="assignment-actions">
              <button onClick={handlePrint} className="print-button">
                🖨️ Print Reference Card
              </button>
              <button onClick={resetLookup} className="secondary-button">
                👥 Look up another person
              </button>
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
                <li>Share the passphrase with all participants</li>
              </ol>
              <p>
                Once that's done, you'll be able to enter the passphrase and
                look up your assignment!
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>🎁 Keep your assignment secret until gift exchange day! 🤫</p>
      </footer>
    </div>
  );
}

export default App;
