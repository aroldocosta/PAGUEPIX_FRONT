import { Device } from './device.model';

export interface Board {
    id: string | number;
    clientId: string;
    model: string;
    description: string;
    script?: { id: string | number, code: string };
    device?: Device;
}

export interface BoardRequest {
    id?: string | number;
    scriptId: string | number;
    deviceId?: string | number;
    clientId: string;
    model: string;
    description: string;
}

export interface BoardResponse extends Board { }
