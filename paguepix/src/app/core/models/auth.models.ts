export interface LoginResponse {
    userId: string;
    token: string;
    role: 'ADMIN' | 'USER';
}

export interface UserSession {
    userId: string;
    token: string;
    role: 'ADMIN' | 'USER';
}
