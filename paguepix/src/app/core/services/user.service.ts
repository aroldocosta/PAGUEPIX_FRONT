import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

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

    getById(id: string | number) {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    save(user: any) {
        return this.http.post<User>(this.apiUrl, user);
    }

    update(user: any) {
        return this.http.put<User>(this.apiUrl, user);
    }

    delete(id: string | number) {
        return this.http.delete<User>(`${this.apiUrl}/${id}`);
    }

    getUserPartner(id: string | number) {
        return this.http.get<any>(`${this.apiUrl}/${id}/partner`);
    }
}
