import { User } from './user.model';
import { Device } from './device.model';
import { Payment } from './payment.model';

export interface PartnerSummary {
    id: string | number;
    name: string;
    logo?: string;
    gateway?: any;
    pixKey?: string;
    commissionRate?: number;
    paymentWorkflowMode?: 'CENTRALIZED_WEB_CHECKOUT' | 'DECENTRALIZED_IN_STORE_QR';
}

export interface PartnerDetail {
    id: string | number;
    name: string;
    logo?: string;
    description?: string;
    gateway?: any;
    pixKey?: string;
    bankCode?: string;
    bankBranch?: string;
    bankAccount?: string;
    bankAccountDigit?: string;
    bankAccountType?: string;
    documentNumber?: string;
    payoutMethod?: string;
    recipientId?: string;
    commissionRate?: number;
    paymentWorkflowMode?: 'CENTRALIZED_WEB_CHECKOUT' | 'DECENTRALIZED_IN_STORE_QR';
    mpUserId?: string;
    mpTokenExpiresAt?: string;
    userList?: User[];
    paymentList?: Payment[];
    deviceList?: Device[];
}

export interface Partner extends PartnerDetail {}
