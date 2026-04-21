import { User } from './user.model';
import { Device } from './device.model';
import { Payment } from './payment.model';

export interface Partner {
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
    userList?: User[];
    paymentList?: Payment[];
    deviceList?: Device[];
}
