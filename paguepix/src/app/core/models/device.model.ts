import { Partner } from './partner.model';

export interface Device {
    id: number;
    code: string;
    model: string;
    partner?: Partner;
}
