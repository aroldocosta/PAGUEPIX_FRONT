import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserSession } from '../../../core/models/auth.models';

@Component({
    selector: 'app-demo-login',
    standalone: true,
    template: '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; color: #1e293b; background: #f8fafc;">Redirecionando para demonstração...</div>',
})
export class DemoLogin implements OnInit {
    private route = inject(ActivatedRoute);
    private authService = inject(AuthService);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const session: UserSession = {
                userId: params['userId'],
                token: params['token'],
                role: params['role'] as 'ADMIN' | 'USER' | 'PARTNER',
                name: params['name'],
                partnerId: params['partnerId'],
                partnerName: params['partnerName'],
                partnerLogo: params['partnerLogo'],
                paymentWorkflowMode: params['paymentWorkflowMode'] as 'CENTRALIZED_WEB_CHECKOUT' | 'DECENTRALIZED_IN_STORE_QR'
            };

            if (session.token && session.userId && session.role) {
                this.authService.setSession(session);
                this.authService.navigateToDashboard();
            } else {
                console.error('Sessão demo inválida:', params);
                this.authService.logout();
            }
        });
    }
}
