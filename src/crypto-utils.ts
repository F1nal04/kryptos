import CryptoJS from "crypto-js";

export type Algorithm = "AES" | "RSA" | "XOR" | "Caesar";

// AES Encryption/Decryption
export const encryptAES = (text: string, key: string): string => {
  try {
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (error) {
    throw new Error("AES encryption failed: " + (error as Error).message);
  }
};

export const decryptAES = (ciphertext: string, key: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error("Invalid key or corrupted data");
    return decrypted;
  } catch (error) {
    throw new Error("AES decryption failed: " + (error as Error).message);
  }
};

// RSA Encryption/Decryption using Web Crypto API
export const generateRSAKeyPair = async (): Promise<{
  publicKey: string;
  privateKey: string;
}> => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKey = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  const privateKey = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKey: arrayBufferToBase64(privateKey),
  };
};

export const encryptRSA = async (
  text: string,
  publicKeyStr: string
): Promise<string> => {
  try {
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      base64ToArrayBuffer(publicKeyStr),
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"]
    );

    const encoded = new TextEncoder().encode(text);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      encoded
    );

    return arrayBufferToBase64(encrypted);
  } catch (error) {
    throw new Error("RSA encryption failed: " + (error as Error).message);
  }
};

export const decryptRSA = async (
  ciphertext: string,
  privateKeyStr: string
): Promise<string> => {
  try {
    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      base64ToArrayBuffer(privateKeyStr),
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["decrypt"]
    );

    const encrypted = base64ToArrayBuffer(ciphertext);
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error("RSA decryption failed: " + (error as Error).message);
  }
};

// XOR Cipher
export const encryptXOR = (text: string, key: string): string => {
  if (!key) throw new Error("Key cannot be empty");

  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(result); // Base64 encode for safe display
};

export const decryptXOR = (ciphertext: string, key: string): string => {
  if (!key) throw new Error("Key cannot be empty");

  try {
    const decoded = atob(ciphertext);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  } catch {
    throw new Error("XOR decryption failed: Invalid data or key");
  }
};

// Caesar Cipher
export const encryptCaesar = (text: string, shift: number): string => {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const isUpperCase = code >= 65 && code <= 90;
    const base = isUpperCase ? 65 : 97;
    return String.fromCharCode(((code - base + shift) % 26) + base);
  });
};

export const decryptCaesar = (ciphertext: string, shift: number): string => {
  return encryptCaesar(ciphertext, 26 - shift);
};

// Helper functions
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Key Generation Functions
export const generateAESKey = (): string => {
  // Generate a random 256-bit (32 byte) key
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

export const generateXORKey = (length: number = 16): string => {
  // Generate a random alphanumeric key
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
};

export const generateCaesarShift = (): number => {
  // Generate a random shift between 1 and 25
  const array = new Uint8Array(1);
  window.crypto.getRandomValues(array);
  return (array[0] % 25) + 1;
};
