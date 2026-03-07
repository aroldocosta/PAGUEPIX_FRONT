import { Device } from './device.model';

export interface Board {
    id: string | number;
    model: string;
    description: string;
    device?: Device;
}

export interface BoardRequest {
    id?: string | number;
    model: string;
    description: string;
}

export interface BoardResponse extends Board { }
