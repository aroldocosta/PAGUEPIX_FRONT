import { Device } from './device.model';
import { Script } from './script.model';
import { Partner } from './partner.model';

export interface Board {
    id: string | number;
    clientId: string;
    model: string;
    description: string;
    script?: Script;
    device?: Device;
    partner?: Partner;
}

export interface BoardRequest {
    id?: string | number;
    scriptId: string | number;
    clientId: string;
    model: string;
    description: string;
}

export interface BoardResponse extends Board { }
