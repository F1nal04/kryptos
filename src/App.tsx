import { useState } from "react";
import "./App.css";
import type { Algorithm } from "./crypto-utils";
import {
  encryptAES,
  decryptAES,
  encrypt3DES,
  decrypt3DES,
  encryptRSA,
  decryptRSA,
  encryptXOR,
  decryptXOR,
  encryptCaesar,
  decryptCaesar,
  encryptVigenere,
  decryptVigenere,
  generateRSAKeyPair,
  generateAESKey,
  generate3DESKey,
  generateXORKey,
  generateCaesarShift,
  generateVigenereKey,
} from "./crypto-utils";
import {
  Lock,
  LockOpen,
  Copy,
  RefreshCw,
  ShieldCheck,
  Info,
  X,
} from "lucide-react";

function App() {
  const [inputText, setInputText] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("AES");
  const [key, setKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false);

  const isRSA = algorithm === "RSA";

  const algorithmInfo: Record<
    Algorithm,
    { name: string; description: string; details: string }
  > = {
    AES: {
      name: "AES (Advanced Encryption Standard)",
      description:
        "Industry-standard symmetric encryption algorithm used worldwide.",
      details:
        "AES is one of the most secure encryption methods available. It uses a 256-bit key and is trusted by governments and organizations globally. Perfect for encrypting sensitive data like passwords, documents, and messages.",
    },
    "3DES": {
      name: "3DES (Triple Data Encryption Standard)",
      description: "Legacy symmetric encryption that applies DES three times.",
      details:
        "3DES was developed to replace the original DES algorithm by applying it three times with different keys. While still secure, it's slower than AES and primarily used in legacy financial systems. Uses a 192-bit key.",
    },
    RSA: {
      name: "RSA (Rivest-Shamir-Adleman)",
      description:
        "Asymmetric public-key cryptography for secure key exchange.",
      details:
        "RSA uses a pair of keys: a public key for encryption and a private key for decryption. This allows secure communication without sharing secret keys. Widely used for digital signatures, SSL/TLS certificates, and secure messaging.",
    },
    XOR: {
      name: "XOR Cipher",
      description: "Simple bitwise encryption for educational purposes.",
      details:
        "XOR cipher performs a bitwise exclusive-or operation between the text and key. While fast and simple, it's not secure for real-world use. Great for understanding basic encryption concepts and how keys work.",
    },
    Caesar: {
      name: "Caesar Cipher",
      description: "Ancient substitution cipher used by Julius Caesar.",
      details:
        "One of the oldest known ciphers, it shifts each letter by a fixed number of positions in the alphabet. Named after Julius Caesar who used it for military communications. Easy to crack but excellent for learning encryption basics.",
    },
    Vigenere: {
      name: "Vigenère Cipher",
      description: "Polyalphabetic substitution cipher using a keyword.",
      details:
        "Invented in the 16th century, the Vigenère cipher uses a repeating keyword to shift letters by different amounts. It was considered 'unbreakable' for centuries and represents a major advancement over simple substitution ciphers like Caesar.",
    },
  };

  const handleGenerateKeys = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { publicKey: pub, privateKey: priv } = await generateRSAKeyPair();
      setPublicKey(pub);
      setPrivateKey(priv);
      setOutput("RSA key pair generated successfully!");
    } catch (err) {
      setError("Failed to generate keys: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = () => {
    setError("");
    try {
      let generatedKey = "";

      switch (algorithm) {
        case "AES":
          generatedKey = generateAESKey();
          setOutput("AES key generated successfully!");
          break;
        case "3DES":
          generatedKey = generate3DESKey();
          setOutput("3DES key generated successfully!");
          break;
        case "XOR":
          generatedKey = generateXORKey(16);
          setOutput("XOR key generated successfully!");
          break;
        case "Caesar": {
          const shift = generateCaesarShift();
          generatedKey = shift.toString();
          setOutput(`Caesar shift generated successfully! (Shift: ${shift})`);
          break;
        }
        case "Vigenere":
          generatedKey = generateVigenereKey(8);
          setOutput("Vigenère key generated successfully!");
          break;
      }

      setKey(generatedKey);
    } catch (err) {
      setError("Failed to generate key: " + (err as Error).message);
    }
  };

  const handleEncrypt = async () => {
    setIsLoading(true);
    setError("");
    setOutput("");

    try {
      if (!inputText) {
        throw new Error("Please enter text to encrypt");
      }

      let result = "";

      switch (algorithm) {
        case "AES":
          if (!key) throw new Error("Please enter a key");
          result = encryptAES(inputText, key);
          break;
        case "3DES":
          if (!key) throw new Error("Please enter a key");
          result = encrypt3DES(inputText, key);
          break;
        case "RSA":
          if (!publicKey)
            throw new Error("Please generate or enter a public key");
          result = await encryptRSA(inputText, publicKey);
          break;
        case "XOR":
          if (!key) throw new Error("Please enter a key");
          result = encryptXOR(inputText, key);
          break;
        case "Caesar": {
          const shift = parseInt(key) || 0;
          if (shift === 0) throw new Error("Please enter a valid shift number");
          result = encryptCaesar(inputText, shift);
          break;
        }
        case "Vigenere":
          if (!key) throw new Error("Please enter a key");
          result = encryptVigenere(inputText, key);
          break;
      }

      setOutput(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrypt = async () => {
    setIsLoading(true);
    setError("");
    setOutput("");

    try {
      if (!inputText) {
        throw new Error("Please enter text to decrypt");
      }

      let result = "";

      switch (algorithm) {
        case "AES":
          if (!key) throw new Error("Please enter a key");
          result = decryptAES(inputText, key);
          break;
        case "3DES":
          if (!key) throw new Error("Please enter a key");
          result = decrypt3DES(inputText, key);
          break;
        case "RSA":
          if (!privateKey)
            throw new Error("Please generate or enter a private key");
          result = await decryptRSA(inputText, privateKey);
          break;
        case "XOR":
          if (!key) throw new Error("Please enter a key");
          result = decryptXOR(inputText, key);
          break;
        case "Caesar": {
          const shift = parseInt(key) || 0;
          if (shift === 0) throw new Error("Please enter a valid shift number");
          result = decryptCaesar(inputText, shift);
          break;
        }
        case "Vigenere":
          if (!key) throw new Error("Please enter a key");
          result = decryptVigenere(inputText, key);
          break;
      }

      setOutput(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlgorithmChange = (newAlgorithm: Algorithm) => {
    setAlgorithm(newAlgorithm);
    setKey("");
    setPublicKey("");
    setPrivateKey("");
    setOutput("");
    setError("");
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleUseOutputAsInput = () => {
    setInputText(output);
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="page-title">Kryptos</h1>
        <div className="card">
          {/* Header */}
          <div className="header">
            <h2 className="header-title">
              <ShieldCheck className="icon" size={24} /> Encryption Settings
            </h2>
            <p className="header-subtitle">
              Select an algorithm and provide the necessary keys
            </p>
          </div>

          {/* Algorithm Selection */}
          <div className="form-group">
            <div className="label-with-info">
              <label htmlFor="algorithm">Algorithm</label>
              <button
                className="info-button"
                onClick={() => setShowAlgorithmInfo(true)}
                type="button"
                aria-label="Algorithm information"
              >
                <Info size={18} />
              </button>
            </div>
            <div className="select-wrapper">
              <select
                id="algorithm"
                value={algorithm}
                onChange={(e) =>
                  handleAlgorithmChange(e.target.value as Algorithm)
                }
                className="select-dropdown"
              >
                <option value="AES">AES (Advanced Encryption Standard)</option>
                <option value="3DES">
                  3DES (Triple Data Encryption Standard)
                </option>
                <option value="RSA">RSA (Public Key Cryptography)</option>
                <option value="XOR">XOR Cipher</option>
                <option value="Caesar">Caesar Cipher</option>
                <option value="Vigenere">Vigenère Cipher</option>
              </select>
            </div>
          </div>

          {/* Algorithm Info Modal */}
          {showAlgorithmInfo && (
            <div
              className="modal-overlay"
              onClick={() => setShowAlgorithmInfo(false)}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>{algorithmInfo[algorithm].name}</h3>
                  <button
                    className="modal-close"
                    onClick={() => setShowAlgorithmInfo(false)}
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <p className="modal-description">
                    <strong>Overview:</strong>{" "}
                    {algorithmInfo[algorithm].description}
                  </p>
                  <p className="modal-details">
                    {algorithmInfo[algorithm].details}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Key Inputs */}
          {isRSA ? (
            <>
              <div className="form-group">
                <label htmlFor="public-key">Public Key</label>
                <textarea
                  id="public-key"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="Public key (used for encryption)"
                  rows={3}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="private-key">Private Key</label>
                <textarea
                  id="private-key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Private key (used for decryption)"
                  rows={3}
                  className="input-field"
                />
              </div>
              <button
                className="btn btn-generate"
                onClick={handleGenerateKeys}
                disabled={isLoading}
              >
                Generate Key Pair
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="key">
                  {algorithm === "Caesar" ? "Shift (number)" : "Encryption Key"}
                </label>
                <input
                  id="key"
                  type={algorithm === "Caesar" ? "number" : "text"}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={
                    algorithm === "Caesar"
                      ? "Enter shift number (e.g., 3)"
                      : algorithm === "Vigenere"
                      ? "Enter alphabetic key (e.g., SECRET)"
                      : "Enter your secret key"
                  }
                  className="input-field"
                />
              </div>
              <button
                className="btn btn-generate"
                onClick={handleGenerateKey}
                disabled={isLoading}
              >
                Generate {algorithm === "Caesar" ? "Shift" : "Key"}
              </button>
            </>
          )}

          {/* Input Text */}
          <div className="form-group">
            <label htmlFor="input-text">Input Text</label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to encrypt or decrypt..."
              rows={6}
              className="input-field textarea-large"
            />
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn btn-encrypt"
              onClick={handleEncrypt}
              disabled={isLoading}
            >
              <Lock className="btn-icon" size={18} /> Encrypt
            </button>
            <button
              className="btn btn-decrypt"
              onClick={handleDecrypt}
              disabled={isLoading}
            >
              <LockOpen className="btn-icon" size={18} /> Decrypt
            </button>
            <button
              className="btn btn-use-output"
              onClick={handleUseOutputAsInput}
              disabled={!output || isLoading}
            >
              <RefreshCw className="btn-icon" size={18} /> Use Output as Input
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="message error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Output */}
          <div className="form-group">
            <div className="output-header">
              <label htmlFor="output">Output</label>
              <button
                className="btn btn-copy"
                onClick={handleCopyOutput}
                disabled={!output}
              >
                <Copy className="btn-icon" size={16} />{" "}
                {copySuccess ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea
              id="output"
              value={output}
              readOnly
              placeholder="Output will appear here..."
              rows={6}
              className="input-field textarea-large output-field"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
