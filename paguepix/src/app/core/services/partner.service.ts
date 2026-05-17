import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PartnerSummary, PartnerDetail } from '../models/partner.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PartnerService {
    private apiUrl = `${environment.apiUrl}/partners`;

    constructor(private http: HttpClient) { }

    getGateways() {
        return this.http.get<any[]>(`${environment.apiUrl}/bank/gateways`);
    }

    getAll(page: number = 0, size: number = 10): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<any>(this.apiUrl, { params });
    }

    getById(id: string | number): Observable<PartnerDetail> {
        return this.http.get<PartnerDetail>(`${this.apiUrl}/${id}`);
    }

    save(partner: any): Observable<PartnerDetail> {
        return this.http.post<PartnerDetail>(this.apiUrl, partner);
    }

    update(partner: any): Observable<PartnerDetail> {
        return this.http.put<PartnerDetail>(this.apiUrl, partner);
    }

    delete(id: string | number): Observable<PartnerDetail> {
        return this.http.delete<PartnerDetail>(`${this.apiUrl}/${id}`);
    }

    uploadLogo(id: string | number, file: File): Observable<PartnerDetail> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<PartnerDetail>(`${this.apiUrl}/${id}/logo`, formData);
    }
}
