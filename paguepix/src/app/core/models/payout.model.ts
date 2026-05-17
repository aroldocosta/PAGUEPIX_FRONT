export interface PayoutSummaryResponse {
    id: string;
    partner?: {
        id: string;
        name: string;
        pixKey?: string;
    };
    amount: number;
    status: 'AVAILABLE' | 'PAID_OUT' | 'FAILED' | string;
    createdAt: string;
    paidAt?: string | null;
    statusMessage?: string | null;
}

export interface PayoutDetailResponse {
    id: string;
    partner?: {
        id: string;
        name: string;
        pixKey?: string;
    };
    amount: number;
    status: 'AVAILABLE' | 'PAID_OUT' | 'FAILED' | string;
    createdAt: string;
    paidAt?: string | null;
    receipt?: string | null;
    statusMessage?: string | null;
}

export interface Payout extends PayoutDetailResponse {}
