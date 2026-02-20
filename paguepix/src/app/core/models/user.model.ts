import { Partner } from './partner.model';

export interface User {
    id: number;
    name: string;
    login: string;
    password?: string;
    role: 'ADMIN' | 'USER';
    partner?: Partner;
}
