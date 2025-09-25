import { useState, useEffect } from "react";
import { findAndDecryptAssignment } from "./utils/encryption";
import {
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
}

function App() {
  const [state, setState] = useState<AppState>({
    assignment: null,
    isDataLoaded: false,
    loading: false,
    error: "",
    success: "",
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

        setState((prev) => ({
          ...prev,
          loading: false,
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
        success: "Assignment found successfully!",
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
                  font-family: "MS Sans Serif", sans-serif;
                  max-width: 400px;
                  margin: 0 auto;
                  padding: 20px;
                  background: #c0c0c0;
                  font-size: 11px;
                }
                .card {
                  border: 2px inset #c0c0c0;
                  padding: 8px;
                  text-align: center;
                  background: #c0c0c0;
                }
                .title {
                  color: #000000;
                  font-size: 12px;
                  font-weight: bold;
                  margin-bottom: 8px;
                }
                .recipient {
                  font-size: 11px;
                  font-weight: bold;
                  color: #000080;
                  margin: 8px 0;
                  background: #ffffff;
                  border: 2px inset #c0c0c0;
                  padding: 4px;
                }
                .bio {
                  font-size: 11px;
                  line-height: 1.2;
                  margin-top: 8px;
                  text-align: left;
                  background: #ffffff;
                  border: 2px inset #c0c0c0;
                  padding: 8px;
                }
                @media print {
                  body { margin: 0; background: white; }
                  .card { border: 1px solid black; background: white; }
                }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="title">Secret Santa Assignment</div>
                <div><strong>For:</strong> ${state.assignment.giver}</div>
                <div class="recipient">Your recipient: ${state.assignment.recipient}</div>
                <div class="bio">
                  <strong>Gift Ideas & Preferences:</strong><br>
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

  return (
    <div className="app">
      {/* Windows 95 Title Bar */}
      <div className="title-bar">
        <div className="title-bar-text">
          <span>🎁</span>
          <span>Secret Santa - SecretSanta.exe</span>
        </div>
        <div className="title-bar-controls">
          <div className="title-bar-control">_</div>
          <div className="title-bar-control">□</div>
          <div className="title-bar-control">×</div>
        </div>
      </div>



      {/* Snowflakes Animation Container */}
      <div className="snowflake-container">
        <div className="ascii-snowflake">*</div>
        <div className="ascii-snowflake">+</div>
        <div className="ascii-snowflake">*</div>
        <div className="ascii-snowflake">+</div>
        <div className="ascii-snowflake">*</div>
        <div className="ascii-snowflake">+</div>
        <div className="ascii-snowflake">*</div>
        <div className="ascii-snowflake">+</div>
        <div className="ascii-snowflake">*</div>
        <div className="ascii-snowflake">+</div>
      </div>

      <header className="header">
        <h1>Secret Santa Lookup</h1>
        <p>Enter your passphrase to view your assignment</p>
      </header>

      <main className="main">
        {/* Loading State */}
        {state.loading && (
          <div className="card">
            <div className="loading blinking-cursor">
              <pre>
                {`  [ LOADING CYBER DATA ]
    ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░
    Accessing mainframe...
    Decrypting gift matrix...`}
              </pre>
            </div>
          </div>
        )}

        {/* Error Display */}
        {state.error && <div className="error-message">{state.error}</div>}

        {/* Success Display */}
        {state.success && !state.error && state.assignment && (
          <div className="success-message">{state.success}</div>
        )}

        {/* Password Input */}
        {needsPassphrase && !state.isDataLoaded && (
          <div className="card" style={{ position: "relative" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <img
                src="/secret-santa/images/snoopy-doghouse.gif"
                alt="Snoopy at his doghouse"
                style={{ maxWidth: "200px", height: "auto" }}
              />
            </div>

            <h2>
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <strong>Enter Passphrase:</strong>
              </div>
            </h2>
            <div className="input-group">
              <input
                type="text"
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                placeholder="Your passphrase"
                onKeyPress={(e) =>
                  e.key === "Enter" && handlePassphraseSubmit()
                }
                disabled={state.loading}
              />
              <button
                onClick={handlePassphraseSubmit}
                disabled={state.loading || !passphraseInput.trim()}
              >
                Enter
              </button>
            </div>
          </div>
        )}

        {/* Assignment Display */}
        {state.assignment && (
          <div className="card assignment-card">
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <img
                src="/secret-santa/images/santa-snoopy.gif"
                alt="Santa Snoopy"
                style={{ maxWidth: "200px", height: "auto" }}
              />
            </div>
            <div className="assignment-header">
              <h2>
                Secret Santa Assignment
              </h2>
              <p className="assignment-subtitle">
                For: {state.assignment.giver}
              </p>
            </div>

            <div className="assignment-content">
              <div className="recipient-section">
                <div className="recipient-label">
                  You are giving a gift to:
                </div>
                <div className="recipient-name">
                  {state.assignment.recipient}
                </div>
              </div>

              {state.assignment.recipientBio && (
                <div className="bio-section">
                  <div className="bio-label">
                    Gift Ideas & Preferences:
                  </div>
                  <div className="bio-content">
                    {state.assignment.recipientBio}
                  </div>
                </div>
              )}

              <div className="assignment-actions">
                <button onClick={handlePrint} className="print-button">
                  Print
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!state.isDataLoaded && !needsPassphrase && !state.loading && (
          <div className="card">
            <h2>
              <pre>
                {`  ╔═══════════════════════════╗
  ║     SYSTEM MANUAL v2.0    ║
  ║   ------------------     ║
  ║   CYBER SANTA PROTOCOL   ║
  ╚═══════════════════════════╝`}
              </pre>
            </h2>
            <div className="instructions">
              <p>
                <pre>
                  {`  *** WELCOME TO THE MATRIX ***

  > INITIALIZING GIFT PROTOCOL...
  > LOADING CYBER SANTA MODULE...
  > READY FOR TRANSMISSION`}
                </pre>
              </p>
              <p>
                <strong>SYSTEM REQUIREMENTS:</strong>
              </p>
              <ol>
                <li>
                  <pre>
                    {`> ADMIN MUST EXECUTE ENCRYPTION SCRIPT
> DEPLOYING SECURE DATA TO MAINFRAME
> TRANSMITTING INDIVIDUAL ACCESS CODES`}
                  </pre>
                </li>
                <li>
                  <pre>
                    {`> RECEIVING UNIQUE CYBER PASSPHRASE
> ENTERING SECURE ACCESS TERMINAL
> DECRYPTING PERSONAL ASSIGNMENT`}
                  </pre>
                </li>
              </ol>
              <p>
                <pre>
                  {`  WARNING: CLASSIFIED INFORMATION
  EACH AGENT HAS UNIQUE ACCESS CODE
  UNAUTHORIZED ACCESS PROHIBITED

  === END SYSTEM MANUAL ===`}
                </pre>
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Secret Santa App - Keep your passphrase private</p>
        <p>Merry Christmas! 🎄</p>
      </footer>


    </div>
  );
}

export default App;
