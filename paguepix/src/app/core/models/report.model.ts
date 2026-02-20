import { Payment } from './payment.model';

export interface PaymentReport {
    customerName: string;
    boardModel?: string;
    boardType?: string;
    boardNumber?: number;
    boardQuantity?: number;
    paymentList: Payment[];
}
