import { Partner } from './partner.model';

export interface Payout {
    id: string;
    partner?: Partner;
    amount: number;
    status: 'AVAILABLE' | 'PAID_OUT' | 'FAILED' | string;
    createdAt: string;
    paidAt?: string | null;
    receipt?: string | null;
    statusMessage?: string | null;
}
