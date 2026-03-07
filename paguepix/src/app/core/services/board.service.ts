import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Board, BoardRequest, BoardResponse } from '../models/board.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BoardService {
    private apiUrl = `${environment.apiUrl}/boards`;

    constructor(private http: HttpClient) { }

    findAll(partnerId?: number, scriptId?: number, page: number = 0, size: number = 10) {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (partnerId) params = params.set('partnerId', partnerId.toString());
        if (scriptId) params = params.set('scriptId', scriptId.toString());

        return this.http.get<any>(this.apiUrl, { params });
    }

    findById(id: string | number) {
        return this.http.get<BoardResponse>(`${this.apiUrl}/${id}`);
    }

    save(board: BoardRequest) {
        return this.http.post<BoardResponse>(this.apiUrl, board);
    }

    update(board: BoardRequest) {
        return this.http.put<BoardResponse>(this.apiUrl, board);
    }

    delete(id: string | number) {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
