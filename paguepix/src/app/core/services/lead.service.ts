import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { LeadSummary, LeadDetail } from '../models/lead.model';

@Injectable({
    providedIn: 'root'
})
export class LeadService {
    private apiUrl = `${environment.apiUrl}/leads`;

    constructor(private http: HttpClient) { }

    findAll(page: number = 0, size: number = 10): Observable<LeadSummary[]> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<LeadSummary[]>(this.apiUrl, { params });
    }

    findById(id: string | number): Observable<LeadDetail> {
        return this.http.get<LeadDetail>(`${this.apiUrl}/${id}`);
    }

    save(lead: any): Observable<LeadDetail> {
        return this.http.post<LeadDetail>(this.apiUrl, lead);
    }

    update(id: string | number, lead: any): Observable<LeadDetail> {
        return this.http.put<LeadDetail>(`${this.apiUrl}/${id}`, lead);
    }

    delete(id: string | number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
