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
                <div class="title">*** CYBER SANTA MISSION ***</div>
                <div><strong>AGENT:</strong> ${state.assignment.giver}</div>
                <div class="recipient">>>> TARGET: ${state.assignment.recipient} <<<</div>
                <div class="bio">
                  <strong>INTEL REPORT:</strong><br>
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
      {/* Retro Visitor Counter */}
      <div className="visitor-counter"></div>

      {/* Radical Cyber Matrix Background */}
      <div className="cyber-container">
        <div className="cyber-star">*</div>
        <div className="cyber-star">+</div>
        <div className="cyber-star">.</div>
        <div className="cyber-star">*</div>
        <div className="cyber-star">+</div>
        <div className="cyber-star">.</div>
        <div className="cyber-star">*</div>
        <div className="cyber-star">+</div>
        <div className="cyber-star">.</div>
        <div className="cyber-star">*</div>
      </div>

      <header className="header">
        <h1>*** SECRET SANTA CYBER LOOKUP ***</h1>
        <p>~~ WELCOME TO THE DIGITAL GIFT MATRIX ~~</p>
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
            <div className="new-badge">NEW!</div>

            {/* Classic 90s Marquee */}
            <div className="marquee-container">
              <div className="marquee-text">
                ★ ★ ★ AUTHORIZED PERSONNEL ONLY ★ MAXIMUM SECURITY ZONE ★ CYBER
                ENCRYPTION ACTIVE ★ ★ ★
              </div>
            </div>

            <h2>
              <div
                className="blinking-cursor"
                style={{
                  fontFamily: "Courier New, monospace",
                  textAlign: "center",
                }}
              >
                <div>╔══════════════════════════╗</div>
                <div>║ SECURE ACCESS POINT ║</div>
                <div>╚══════════════════════════╝</div>
              </div>
            </h2>
            <div className="input-group">
              <input
                type="text"
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                placeholder=">>> ENTER CYBER KEY <<<"
                onKeyPress={(e) =>
                  e.key === "Enter" && handlePassphraseSubmit()
                }
                disabled={state.loading}
              />
              <button
                onClick={handlePassphraseSubmit}
                disabled={state.loading || !passphraseInput.trim()}
              >
                [[ DECRYPT DATA ]]
              </button>
            </div>
          </div>
        )}

        {/* Assignment Display */}
        {state.assignment && (
          <div className="card assignment-card">
            <div className="assignment-header">
              <h2>
                <pre>
                  {`  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ░  AGENT: ${state.assignment.giver.toUpperCase()}  ░
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`}
                </pre>
              </h2>
              <p className="assignment-subtitle">
                === MISSION BRIEFING DECODED ===
              </p>
            </div>

            <div className="assignment-content">
              <div className="recipient-section">
                <div className="recipient-label">
                  <pre>
                    {`    ┌─ TARGET ACQUIRED ─┐
    │                   │
    └───────────────────┘`}
                  </pre>
                </div>
                <div className="recipient-name">
                  {state.assignment.recipient.toUpperCase()}
                </div>
              </div>

              {state.assignment.recipientBio && (
                <div className="bio-section">
                  <div className="bio-label">
                    <pre>
                      {`  ┌─── INTEL REPORT ───┐
  │   Gift Database    │
  └────────────────────┘`}
                    </pre>
                  </div>
                  <div className="bio-content">
                    <div>
                      &gt; SUBJECT PROFILE:
                      <br />
                      &gt; {state.assignment.recipientBio}
                      <br />
                      &gt; END TRANSMISSION
                    </div>
                  </div>
                </div>
              )}

              <div className="assignment-actions">
                <button onClick={handlePrint} className="print-button">
                  [[ PRINT DATA ]]
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
        <pre>
          {`  ┌──────────────────────────────────────────┐
  │  CLASSIFIED: TOP SECRET TRANSMISSION     │
  │  MAINTAIN OPERATIONAL SECURITY           │
  │  CYBER PASSPHRASE = PERSONAL PROPERTY    │
  │  UNAUTHORIZED SHARING PROHIBITED         │
  └──────────────────────────────────────────┘`}
        </pre>
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <pre style={{ fontSize: "12px", color: "var(--matrix-green)" }}>
            {`[WEBRINGS] -> [CYBERSPACE] -> [GEOCITIES] -> [ANGELFIRE]

            This site is a member of the:
            ★ SECRET SANTA CYBER RING ★
            [ << PREV ] [ RANDOM ] [ NEXT >> ]

            Last updated: ${new Date().toLocaleDateString()}
            Site optimized for 56k modem`}
          </pre>
        </div>
      </footer>

      {/* Classic 90s Status Bar */}
      <div className="status-bar"></div>
    </div>
  );
}

export default App;
