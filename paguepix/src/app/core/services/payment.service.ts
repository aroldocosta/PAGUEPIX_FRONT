import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Payment, PaymentSummary, PaymentDetail, ChargeResponse, ChargeStatus } from '../models/payment.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = `${environment.apiUrl}/payments`;

    constructor(private http: HttpClient) { }

    getAll(partnerId?: string | number, page: number = 0, size: number = 10) {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (partnerId) {
            params = params.set('partnerId', partnerId.toString());
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    getById(id: string | number) {
        return this.http.get<PaymentDetail>(`${this.apiUrl}/${id}`);
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
        return this.http.post<ChargeStatus>(`${this.apiUrl}/status/rsa`, request);
    }

    getPaymentStatusJwt(request: { externalId: string }) {
        return this.http.post<ChargeStatus>(`${this.apiUrl}/status/jwt`, request);
    }

    // Deprecated generic methods - keep for compatibility if needed elsewhere, 
    // but update to redirect to RSA by default for now if it's the primary use case
    createCharge(request: any) {
        return this.createChargeRsa(request);
    }

    getPaymentStatus(request: { payload: string }) {
        return this.getPaymentStatusRsa(request);
    }

    lookupLicense(controllerId: string, licenseId: string, productName?: string, productId?: number) {
        let params = new HttpParams()
            .set('controllerId', controllerId)
            .set('licenseId', licenseId);
        
        if (productName) {
            params = params.set('productName', productName);
        }

        if (productId) {
            params = params.set('productId', productId.toString());
        }
        
        return this.http.get<any>(`${environment.apiUrl}/licenses/public/lookup`, { params });
    }
}
