import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Partner } from '../models/partner.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PartnerService {
    private apiUrl = `${environment.apiUrl}/partners`;

    constructor(private http: HttpClient) { }

    getAll(page: number = 0, size: number = 10) {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<any>(this.apiUrl, { params });
    }

    getById(id: string | number) {
        return this.http.get<Partner>(`${this.apiUrl}/${id}`);
    }

    save(partner: any) {
        return this.http.post<Partner>(this.apiUrl, partner);
    }

    update(partner: any) {
        return this.http.put<Partner>(this.apiUrl, partner);
    }

    delete(id: string | number) {
        return this.http.delete<Partner>(`${this.apiUrl}/${id}`);
    }

    uploadLogo(id: string | number, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<Partner>(`${this.apiUrl}/${id}/logo`, formData);
    }
}
