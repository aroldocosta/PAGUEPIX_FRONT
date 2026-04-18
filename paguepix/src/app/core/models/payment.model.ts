import { Device } from './device.model';
import { Partner } from './partner.model';

export interface Payment {
    id: number;
    paidValue: number;
    type: string;
    description: string;
    time: string;
    date: string;
    device?: Device;
    partner?: Partner;
    externalId: string;
    transferReceipt?: string;
    state: string;
    solicitationChannel: string;
    qrCode?: string;
    paymentLink?: string;
    customerPhone?: string;
    commissionRate?: number;
    commissionAmount?: number;
    transferredValue?: number;
    transactionId?: string;
    netAmount?: number;
    usageTime?: string;
}

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
}
