export interface LoginResponse {
    userId: string;
    token: string;
    role: 'ADMIN' | 'USER' | 'PARTNER';
    name: string;
    partnerId?: string | number;
    partnerName?: string;
    partnerLogo?: string;
    paymentWorkflowMode?: 'CENTRALIZED_WEB_CHECKOUT' | 'DECENTRALIZED_IN_STORE_QR';
}

export interface UserSession {
    userId: string;
    token: string;
    role: 'ADMIN' | 'USER' | 'PARTNER';
    name: string;
    partnerId?: string | number;
    partnerName?: string;
    partnerLogo?: string;
    paymentWorkflowMode?: 'CENTRALIZED_WEB_CHECKOUT' | 'DECENTRALIZED_IN_STORE_QR';
}

