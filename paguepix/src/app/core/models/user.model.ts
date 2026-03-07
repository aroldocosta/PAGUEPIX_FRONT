import { Partner } from './partner.model';

export interface User {
    id: string | number;
    name: string;
    login: string;
    password?: string;
    role: 'ADMIN' | 'USER';
    partner?: Partner;
}
