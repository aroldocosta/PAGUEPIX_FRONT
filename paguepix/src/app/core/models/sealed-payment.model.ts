export interface SealedPaymentRequest {
    deviceToken: string;
    productId?: number;
    duration: number;
    timestamp: string; // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
    name?: string;
    whatsapp?: string;
    controllerId?: string;
    licenseId?: string;
}

export interface SealedStatusRequest {
    deviceId: string;
    externalId: string;
    timestamp: string;
}
