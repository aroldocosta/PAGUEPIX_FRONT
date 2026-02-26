export interface SealedPaymentRequest {
    deviceToken: string;
    duration: number;
    timestamp: string; // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
}

export interface SealedStatusRequest {
    deviceId: string;
    partnerId: string;
    externalId: string;
    timestamp: string;
}
