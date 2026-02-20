import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Partner } from '../models/partner.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PartnerService {
    private apiUrl = `${environment.apiUrl}/partners`;

    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Partner[]>(this.apiUrl);
    }

    getById(id: number) {
        return this.http.get<Partner>(`${this.apiUrl}/${id}`);
    }
}
