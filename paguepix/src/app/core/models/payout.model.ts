export interface Payout {
    id: string;
    partnerId: string;
    amount: number;
    status: 'AVAILABLE' | 'TRANSFERRED' | 'FAILED' | string;
    createdAt: string;
    paidAt?: string | null;
    receipt?: string | null;
    statusMessage?: string | null;
}
