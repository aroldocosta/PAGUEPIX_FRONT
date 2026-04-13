import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DeviceService {
    private apiUrl = `${environment.apiUrl}/devices`;

    constructor(private http: HttpClient) { }

    findAll(partnerId?: number, page: number = 0, size: number = 10): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (partnerId) {
            params = params.set('partnerId', partnerId.toString());
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    getDeviceTypes(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/types`);
    }

    findById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    save(device: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, device);
    }

    update(id: string, device: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, device);
    }

    delete(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    getInfoByToken(token: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/info/${token}`);
    }

    release(id: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/release`, {});
    }

    releaseManual(id: string, minutes: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/release-manual`, {}, {
            params: { minutes: minutes.toString() }
        });
    }

    addProductToDevice(deviceId: string, productId: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${deviceId}/products/${productId}`, {});
    }

    removeProductFromDevice(deviceId: string, productId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${deviceId}/products/${productId}`);
    }
}
