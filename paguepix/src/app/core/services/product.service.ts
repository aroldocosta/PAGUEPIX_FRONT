import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Product {
    id?: string;
    name: string;
    duration: number;
    durationUnit: 'SECONDS' | 'MINUTES' | 'HOURS';
    price: number;
    active: boolean;
    subtitle?: string;
    description?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;

    constructor(private http: HttpClient) { }

    findAll(page: number = 0, size: number = 100): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<any>(this.apiUrl, { params });
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
