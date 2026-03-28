import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Lead } from '../models/lead.model';

@Injectable({
    providedIn: 'root'
})
export class LeadService {
    private apiUrl = `${environment.apiUrl}/leads`;

    constructor(private http: HttpClient) { }

    findAll(page: number = 0, size: number = 10): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<any>(this.apiUrl, { params });
    }

    findById(id: string | number): Observable<Lead> {
        return this.http.get<Lead>(`${this.apiUrl}/${id}`);
    }

    save(lead: any): Observable<Lead> {
        return this.http.post<Lead>(this.apiUrl, lead);
    }

    update(id: string | number, lead: any): Observable<Lead> {
        return this.http.put<Lead>(`${this.apiUrl}/${id}`, lead);
    }

    delete(id: string | number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
