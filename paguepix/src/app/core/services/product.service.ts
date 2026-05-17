import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, shareReplay } from 'rxjs';

import { Partner } from '../models/partner.model';

export interface Product {
    id?: string;
    name: string;
    duration: number;
    durationUnit: 'SECONDS' | 'MINUTES' | 'HOURS';
    price: number;
    active: boolean;
    subtitle?: string;
    description?: string;
    deliveryMethod?: string;
    partner?: Partner;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;
    private deliveryMethodsCache$?: Observable<string[]>;

    constructor(private http: HttpClient) { }

    findAll(partnerId?: string | number, page: number = 0, size: number = 100): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (partnerId) {
            params = params.set('partnerId', partnerId.toString());
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    getDeliveryMethods(): Observable<string[]> {
        if (!this.deliveryMethodsCache$) {
            this.deliveryMethodsCache$ = this.http.get<string[]>(`${this.apiUrl}/delivery-methods`).pipe(
                shareReplay(1)
            );
        }
        return this.deliveryMethodsCache$;
    }

    findAllActive(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/active`);
    }

    findById(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    save(product: Product): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, product);
    }

    update(id: string, product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
