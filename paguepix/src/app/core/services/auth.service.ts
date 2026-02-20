import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationDTO, LoginDTO } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    currentUser = signal<LoginDTO | null>(null);

    constructor(private http: HttpClient) { }

    login(auth: AuthenticationDTO) {
        return this.http.post<LoginDTO>(this.apiUrl, auth).pipe(
            tap(user => this.currentUser.set(user))
        );
    }

    logout() {
        this.currentUser.set(null);
    }
}
