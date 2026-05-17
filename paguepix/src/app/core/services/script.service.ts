import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ScriptRequest, ScriptSummaryResponse, ScriptDetailResponse } from '../models/script.model';

@Injectable({
    providedIn: 'root'
})
export class ScriptService {
    private apiUrl = `${environment.apiUrl}/scripts`;

    constructor(private http: HttpClient) { }

    findAll(page: number = 0, size: number = 10): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<any>(this.apiUrl, { params });
    }

    findById(id: string | number): Observable<ScriptDetailResponse> {
        return this.http.get<ScriptDetailResponse>(`${this.apiUrl}/${id}`);
    }

    save(script: ScriptRequest): Observable<ScriptDetailResponse> {
        return this.http.post<ScriptDetailResponse>(this.apiUrl, script);
    }

    update(script: ScriptRequest): Observable<ScriptDetailResponse> {
        return this.http.put<ScriptDetailResponse>(this.apiUrl, script);
    }

    delete(id: string | number): Observable<ScriptDetailResponse> {
        return this.http.delete<ScriptDetailResponse>(`${this.apiUrl}/${id}`);
    }
}
