import { User } from './user.model';
import { Device } from './device.model';
import { Payment } from './payment.model';

export interface Partner {
    id: string | number;
    name: string;
    logo?: string;
    description?: string;
    bankProvider?: string;
    pixKey?: string;
    adminFee?: number;
    userList?: User[];
    paymentList?: Payment[];
    deviceList?: Device[];
}
