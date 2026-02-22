import { Injectable, signal, computed } from '@angular/core';
import { UserSession } from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly STORAGE_KEY = 'paguepix_session';

    // Signal para estado da sessão
    private sessionSignal = signal<UserSession | null>(this.loadSession());

    // Seletores calculados
    isAuthenticated = computed(() => !!this.sessionSignal());
    token = computed(() => this.sessionSignal()?.token);
    userId = computed(() => this.sessionSignal()?.userId);
    role = computed(() => this.sessionSignal()?.role);

    setSession(session: UserSession) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        this.sessionSignal.set(session);
    }

    logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.sessionSignal.set(null);
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
