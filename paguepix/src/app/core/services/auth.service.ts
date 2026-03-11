import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserSession } from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private router = inject(Router);
    private readonly STORAGE_KEY = 'paguepix_session';

    // Signal para estado da sessão
    private sessionSignal = signal<UserSession | null>(this.loadSession());

    // Seletores calculados
    isAuthenticated = computed(() => {
        const session = this.sessionSignal();
        if (!session || !session.token) return false;
        return !this.isTokenExpired(session.token);
    });
    token = computed(() => this.sessionSignal()?.token);
    userId = computed(() => this.sessionSignal()?.userId);
    role = computed(() => this.sessionSignal()?.role);
    name = computed(() => this.sessionSignal()?.name ?? '');
    partnerId = computed(() => this.sessionSignal()?.partnerId);
    partnerName = computed(() => this.sessionSignal()?.partnerName ?? '');

    isTokenExpired(token: string): boolean {
        try {
            const payloadBase64 = token.split('.')[1];
            if (!payloadBase64) return true;

            const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
            const payload = JSON.parse(payloadJson);

            if (!payload.exp) return false; // Se não tem exp, assume-se válido

            // exp é em segundos, Date.now() em milissegundos
            const expirationTime = payload.exp * 1000;
            return Date.now() > expirationTime;
        } catch (e) {
            return true; // Se der erro ao ler o token, considera expirado
        }
    }

    setSession(session: UserSession) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        this.sessionSignal.set(session);
    }

    navigateToDashboard() {
        const userRole = this.role();
        if (userRole === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
        } else if (userRole === 'USER' || userRole === 'PARTNER') {
            this.router.navigate(['/user/dashboard']);
        } else {
            this.router.navigate(['/login']);
        }
    }


    logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.sessionSignal.set(null);
        this.router.navigate(['/login']);
    }

    private loadSession(): UserSession | null {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return null;
            }
        }
        return null;
    }
}
