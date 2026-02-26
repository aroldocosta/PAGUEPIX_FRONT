import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Payment, ChargeResponse } from '../models/payment.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = `${environment.apiUrl}/payments`;

    constructor(private http: HttpClient) { }

    getAll(partnerId?: number, page: number = 0, size: number = 10) {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (partnerId) {
            params = params.set('partnerId', partnerId.toString());
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    getById(id: number) {
        return this.http.get<Payment>(`${this.apiUrl}/${id}`);
    }

    payout(request: any) {
        return this.http.post<string>(`${this.apiUrl}/payout`, request);
    }

    createChargeRsa(request: { payload: string }) {
        return this.http.post<ChargeResponse>(`${this.apiUrl}/charge/rsa`, request);
    }

    createChargeJwt(request: any) {
        return this.http.post<ChargeResponse>(`${this.apiUrl}/charge/jwt`, request);
    }

    getPaymentStatusRsa(request: { payload: string }) {
        return this.http.post<any>(`${this.apiUrl}/status/rsa`, request);
    }

    getPaymentStatusJwt(request: { externalId: string }) {
        return this.http.post<any>(`${this.apiUrl}/status/jwt`, request);
    }

    // Deprecated generic methods - keep for compatibility if needed elsewhere, 
    // but update to redirect to RSA by default for now if it's the primary use case
    createCharge(request: any) {
        return this.createChargeRsa(request);
    }

    getPaymentStatus(request: { payload: string }) {
        return this.getPaymentStatusRsa(request);
    }
}
