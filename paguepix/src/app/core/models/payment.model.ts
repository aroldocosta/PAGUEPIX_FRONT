import { Device } from './device.model';
import { Partner } from './partner.model';

export interface PaymentSummary {
    id: string | number;
    paidValue: number;
    type: string;
    description: string;
    time: string;
    date: string;
    externalId: string;
    commissionRate?: number;
    commissionAmount?: number;
    netAmount?: number;
    state: string;
    device?: {
        id: string | number;
        name: string;
        model?: string;
    };
    partner?: {
        id: string | number;
        name: string;
    };
}

export interface PaymentDetail extends PaymentSummary {
    externalReference?: string;
    paymentLink?: string;
    qrCode?: string;
    usageTime?: string;
    transferReceipt?: string;
    solicitationChannel?: string;
    customerPhone?: string;
    transferredValue?: number;
    transactionId?: string;
    license?: {
        id: string | number;
        userName?: string;
        whatsapp?: string;
        controllerId?: string;
        licenseId?: string;
        value?: string;
    };
}

export interface Payment extends PaymentDetail {}

export interface ChargeResponse {
    id?: string;
    paidValue?: string;
    type?: string;
    description?: string;
    date?: string;
    time?: string;
    deviceCode?: string;
    externalId: string;
    externalReference: string;
    paymentLink: string;
    qrCode: string | null;
    state?: string;
    status?: string;
    device?: {
        id: string;
        code: string;
    };
    partner?: {
        id: string;
        name: string;
    };
    provider?: string;
}

export interface ChargeStatus {
    status: string;
    details: string;
    paid: boolean;
    transactionId: string;
    externalReference: string;
    qrCode?: string;
    totalPaidAmount?: number;
    provider?: string;
    licenseId?: string;
    controllerId?: string;
    activationKey?: string;
    deviceId?: string;
}
