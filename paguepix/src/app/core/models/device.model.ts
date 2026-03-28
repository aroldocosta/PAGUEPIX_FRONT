import { Partner } from './partner.model';
import { Board } from './board.model';

export interface Device {
    id: number;
    code: string;
    model: string;
    type: string;
    name: string;
    partner?: Partner;
    board?: Board;
    boardId?: number;
}
