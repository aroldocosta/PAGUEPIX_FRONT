import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Payment } from '../models/payment.model';
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

    createCharge(request: any) {
        return this.http.post<Payment>(`${this.apiUrl}/charge`, request);
    }
}
