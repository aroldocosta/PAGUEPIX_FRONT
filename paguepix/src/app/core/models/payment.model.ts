import { Device } from './device.model';
import { Partner } from './partner.model';

export interface Payment {
    id: number;
    value: number;
    type: string;
    description: string;
    time: string;
    date: string;
    device?: Device;
    partner?: Partner;
    externalId: string;
    transferDone: boolean;
    transferReceipt?: string;
    state: string;
    solicitationChannel: string;
    qrCode?: string;
    paymentLink?: string;
    customerPhone?: string;
    feeValue?: number;
    transferredValue?: number;
    transactionId?: string;
    netAmount?: number;
    totalPaidAmount?: number;
}

export interface ChargeResponse {
    id: string;
    value: string;
    type: string;
    description: string;
    date: string;
    time: string;
    deviceCode: string;
    externalId: string;
    externalReference: string;
    paymentLink: string;
    qrCode: string | null;
    state: string;
    device: {
        id: string;
        code: string;
    };
    partner: {
        id: string;
        name: string;
    };
}

export interface ChargeStatus {
    status: string;
    details: string;
    paid: boolean;
    transactionId: string;
    externalReference: string;
    netAmount?: number;
    totalPaidAmount?: number;
}
