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
