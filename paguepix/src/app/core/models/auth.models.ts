export interface LoginResponse {
    userId: string;
    token: string;
    role: 'ADMIN' | 'USER' | 'PARTNER';
    name: string;
    partnerId?: string | number;
    partnerName?: string;
}

export interface UserSession {
    userId: string;
    token: string;
    role: 'ADMIN' | 'USER' | 'PARTNER';
    name: string;
    partnerId?: string | number;
    partnerName?: string;
}

