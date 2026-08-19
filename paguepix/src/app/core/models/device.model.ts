import { Partner } from './partner.model';
import { Board } from './board.model';

export interface Device {
    id: string | number;
    code: string;
    model: string;
    type: string;
    name: string;
    partner?: Partner;
    board?: Board;
    boardId?: string | number;
    externalStoreId?: string;
    externalPosId?: string;
}
