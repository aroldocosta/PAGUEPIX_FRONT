import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserSummaryResponse, UserDetailResponse, UserRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getAll(partnerId?: string | number, page: number = 0, size: number = 10): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (partnerId) {
            params = params.set('partnerId', partnerId.toString());
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    getById(id: string | number): Observable<UserDetailResponse> {
        return this.http.get<UserDetailResponse>(`${this.apiUrl}/${id}`);
    }

    save(user: UserRequest): Observable<UserDetailResponse> {
        return this.http.post<UserDetailResponse>(this.apiUrl, user);
    }

    update(user: UserRequest): Observable<UserDetailResponse> {
        return this.http.put<UserDetailResponse>(this.apiUrl, user);
    }

    delete(id: string | number): Observable<UserDetailResponse> {
        return this.http.delete<UserDetailResponse>(`${this.apiUrl}/${id}`);
    }

    getUserPartner(id: string | number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}/partner`);
    }
}
