import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, shareReplay } from 'rxjs';

import { Partner } from '../models/partner.model';

export interface ProductSummaryResponse {
    id?: string;
    name: string;
    duration: number;
    durationUnit: 'SECONDS' | 'MINUTES' | 'HOURS';
    price: number;
    active: boolean;
    partner?: Partner;
}

export interface ProductDetailResponse {
    id?: string;
    name: string;
    duration: number;
    durationUnit: 'SECONDS' | 'MINUTES' | 'HOURS';
    price: number;
    active: boolean;
    subtitle?: string;
    description?: string;
    deliveryMethod?: string;
    deliveryConfig?: any;
    freq?: number;
    qtd?: number;
    partner?: Partner;
    boardChannel?: number;
    channel?: number;
}

export interface Product extends ProductDetailResponse {}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;
    private deliveryMethodsCache$?: Observable<string[]>;

    constructor(private http: HttpClient) { }

    findAll(partnerId?: string | number, page: number = 0, size: number = 100): Observable<{ content: ProductSummaryResponse[], totalPages: number } | ProductSummaryResponse[]> {
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

    findAllActive(): Observable<ProductSummaryResponse[]> {
        return this.http.get<ProductSummaryResponse[]>(`${this.apiUrl}/active`);
    }

    findById(id: string): Observable<ProductDetailResponse> {
        return this.http.get<ProductDetailResponse>(`${this.apiUrl}/${id}`);
    }

    create(product: any): Observable<ProductDetailResponse> {
        return this.http.post<ProductDetailResponse>(this.apiUrl, product);
    }

    save(product: Product): Observable<ProductDetailResponse> {
        return this.http.post<ProductDetailResponse>(this.apiUrl, product);
    }

    update(id: string, product: Product): Observable<ProductDetailResponse> {
        return this.http.put<ProductDetailResponse>(`${this.apiUrl}/${id}`, product);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
