import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CryptoService {

    constructor() { }

    /**
     * Encrypts a payload string or object using an RSA public key (PEM format).
     * @param payload The data to encrypt.
     * @param publicKeyPem The public key in PEM format.
     * @returns A Promise that resolves to the Base64-encoded ciphertext.
     */
    async encrypt(payload: any, publicKeyPem: string): Promise<string> {
        const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        const publicKey = await this.importPublicKey(publicKeyPem);

        const encryptedBuffer = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            publicKey,
            dataBuffer
        );

        return this.arrayBufferToBase64(encryptedBuffer);
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
