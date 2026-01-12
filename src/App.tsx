import { useState } from "react";
import "./App.css";
import type { Algorithm } from "./crypto-utils";
import {
  encryptAES,
  decryptAES,
  encryptRSA,
  decryptRSA,
  encryptXOR,
  decryptXOR,
  encryptCaesar,
  decryptCaesar,
  generateRSAKeyPair,
  generateAESKey,
  generateXORKey,
  generateCaesarShift,
} from "./crypto-utils";

function App() {
  const [inputText, setInputText] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("AES");
  const [key, setKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isRSA = algorithm === "RSA";

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

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">🔐 Kryptos</h1>
        <p className="subtitle">
          Encrypt and decrypt text using various algorithms
        </p>

        <div className="card">
          {/* Input Text */}
          <div className="form-group">
            <label htmlFor="input-text">Input Text</label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
              rows={4}
            />
          </div>

          {/* Algorithm Selection */}
          <div className="form-group">
            <label htmlFor="algorithm">Algorithm</label>
            <select
              id="algorithm"
              value={algorithm}
              onChange={(e) =>
                handleAlgorithmChange(e.target.value as Algorithm)
              }
            >
              <option value="AES">AES (Advanced Encryption Standard)</option>
              <option value="RSA">RSA (Public Key Cryptography)</option>
              <option value="XOR">XOR Cipher</option>
              <option value="Caesar">Caesar Cipher</option>
            </select>
          </div>

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
                />
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleGenerateKeys}
                disabled={isLoading}
              >
                🔑 Generate Key Pair
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="key">
                  {algorithm === "Caesar" ? "Shift (number)" : "Key"}
                </label>
                <input
                  id="key"
                  type={algorithm === "Caesar" ? "number" : "text"}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={
                    algorithm === "Caesar"
                      ? "Enter shift number (e.g., 3)"
                      : "Enter encryption key"
                  }
                />
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleGenerateKey}
                disabled={isLoading}
              >
                🔑 Generate {algorithm === "Caesar" ? "Shift" : "Key"}
              </button>
            </>
          )}

          {/* Action Buttons */}
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={handleEncrypt}
              disabled={isLoading}
            >
              🔒 Encrypt
            </button>
            <button
              className="btn btn-primary"
              onClick={handleDecrypt}
              disabled={isLoading}
            >
              🔓 Decrypt
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
            <label htmlFor="output">Output</label>
            <textarea
              id="output"
              value={output}
              readOnly
              placeholder="Result will appear here..."
              rows={6}
            />
          </div>

          {/* Move to Input Button */}
          {output && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setInputText(output);
              }}
            >
              ⬆️ Move to Input
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
