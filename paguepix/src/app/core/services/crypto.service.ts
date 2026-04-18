import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CryptoService {

    constructor() { }

    /**
     * Encrypts a payload using Hybrid Encryption (RSA + AES-GCM).
     * This solves the size limitation of pure RSA encryption.
     * @param payload The data to encrypt.
     * @param publicKeyPem The RSA public key in PEM format.
     * @returns A Promise that resolves to the combined ciphertext string: ENC_AES_KEY:IV:CIPHERTEXT
     */
    async encrypt(payload: any, publicKeyPem: string): Promise<string> {
        const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        // 1. Generate random AES-GCM key (256 bits)
        const aesKey = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt"]
        );

        // 2. Generate random IV (12 bytes recommended for GCM)
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // 3. Encrypt data with AES-GCM
        const encryptedDataBuffer = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            aesKey,
            dataBuffer
        );

        // 4. Encrypt the AES key with RSA-OAEP
        const exportedAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
        const rsaPublicKey = await this.importPublicKey(publicKeyPem);
        const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            rsaPublicKey,
            exportedAesKey
        );

        // 5. Return combined format: base64(encrypted_aes_key):base64(iv):base64(ciphertext)
        return [
            this.arrayBufferToBase64(encryptedAesKeyBuffer),
            this.arrayBufferToBase64(iv.buffer),
            this.arrayBufferToBase64(encryptedDataBuffer)
        ].join(':');
    }

    private async importPublicKey(pem: string): Promise<CryptoKey> {
        // Remove PEM headers, footers, and whitespace
        const pemCleaned = pem
            .replace(/-----BEGIN PUBLIC KEY-----/g, '')
            .replace(/-----END PUBLIC KEY-----/g, '')
            .replace(/\s/g, '');

        const binaryDerString = window.atob(pemCleaned);
        const binaryDer = new Uint8Array(binaryDerString.length);
        for (let i = 0; i < binaryDerString.length; i++) {
            binaryDer[i] = binaryDerString.charCodeAt(i);
        }

        return window.crypto.subtle.importKey(
            "spki",
            binaryDer.buffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["encrypt"]
        );
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}
