import { Device } from './device.model';

export interface Board {
    id: number;
    model: string;
    description: string;
    device?: Device;
}

export interface BoardRequest {
    id?: number;
    model: string;
    description: string;
}

export interface BoardResponse extends Board { }
