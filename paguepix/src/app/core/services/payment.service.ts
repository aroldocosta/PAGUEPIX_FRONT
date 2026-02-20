import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Payment } from '../models/payment.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = `${environment.apiUrl}/payments`;

    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Payment[]>(this.apiUrl);
    }

    getById(id: number) {
        return this.http.get<Payment>(`${this.apiUrl}/${id}`);
    }
}
