import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ScriptRequest, ScriptResponse } from '../models/script.model';

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

    findById(id: number): Observable<ScriptResponse> {
        return this.http.get<ScriptResponse>(`${this.apiUrl}/${id}`);
    }

    save(script: ScriptRequest): Observable<ScriptResponse> {
        return this.http.post<ScriptResponse>(this.apiUrl, script);
    }

    update(script: ScriptRequest): Observable<ScriptResponse> {
        return this.http.put<ScriptResponse>(this.apiUrl, script);
    }

    delete(id: number): Observable<ScriptResponse> {
        return this.http.delete<ScriptResponse>(`${this.apiUrl}/${id}`);
    }
}
