export interface UserSummaryResponse {
    id: string | number;
    name: string;
    login: string;
    role: 'ADMIN' | 'PARTNER';
    partner?: {
        id: string | number;
        name: string;
    };
}

export interface UserDetailResponse {
    id: string | number;
    name: string;
    login: string;
    role: 'ADMIN' | 'PARTNER';
    partner?: {
        id: string | number;
        name: string;
    };
}

export interface UserRequest {
    id?: string | number;
    name: string;
    login: string;
    password?: string;
    role: 'ADMIN' | 'PARTNER';
    partnerId?: number | null;
}

export interface User extends UserDetailResponse {}

