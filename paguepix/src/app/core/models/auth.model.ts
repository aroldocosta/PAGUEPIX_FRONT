export interface AuthenticationDTO {
    login: string;
    password?: string;
}

export interface LoginDTO {
    userId: number;
    token: string;
}
