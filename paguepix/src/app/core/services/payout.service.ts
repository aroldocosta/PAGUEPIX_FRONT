import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Payout, PayoutSummaryResponse, PayoutDetailResponse } from '../models/payout.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PayoutService {
    private apiUrl = `${environment.apiUrl}/payouts`;

    constructor(private http: HttpClient) { }

    getAll(partnerId?: string, page: number = 0, size: number = 10) {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (partnerId) {
            params = params.set('partnerId', partnerId);
        }

        return this.http.get<{ content: PayoutSummaryResponse[], totalPages: number }>(this.apiUrl, { params });
    }

    getById(id: string) {
        return this.http.get<PayoutDetailResponse>(`${this.apiUrl}/${id}`);
    }

    uploadReceipt(id: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<PayoutDetailResponse>(`${this.apiUrl}/${id}/receipt`, formData);
    }

    getReceipt(id: string) {
        return this.http.get(`${this.apiUrl}/${id}/receipt`, { responseType: 'blob' });
    }
}
