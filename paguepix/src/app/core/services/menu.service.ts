import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export interface MenuItem {
    label: string;
    icon: string;
    route: string;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
    private authService = inject(AuthService);

    readonly adminMenuItems: MenuItem[] = [
        { label: 'Dashboard', icon: 'home', route: '/admin/dashboard' },
        { label: 'Estatísticas', icon: 'query_stats', route: '/admin/statistics' },
        { label: 'Produtos', icon: 'local_offer', route: '/admin/products' },
        { label: 'Parceiros', icon: 'handshake', route: '/admin/partners' },
        { label: 'Pagamentos', icon: 'payments', route: '/admin/payments' },
        { label: 'Usuários', icon: 'group', route: '/admin/users' },
        { label: 'Devices', icon: 'devices', route: '/admin/devices' },
        { label: 'Placas', icon: 'memory', route: '/admin/boards' },
        { label: 'Scripts', icon: 'code', route: '/admin/scripts' },
        { label: 'Leads', icon: 'person_add', route: '/admin/leads' },
        { label: 'Saques', icon: 'account_balance', route: '/admin/payouts' },
    ];

    readonly userMenuItems: MenuItem[] = [
        { label: 'Dashboard', icon: 'home', route: '/user/dashboard' },
        { label: 'Saques', icon: 'account_balance', route: '/user/payout' },
        { label: 'Vendas', icon: 'history', route: '/user/sales' },
        { label: 'Devices', icon: 'devices', route: '/user/devices' },
    ];

    readonly menuItems = computed(() =>
        this.authService.role() === 'ADMIN'
            ? this.adminMenuItems
            : this.userMenuItems
    );
}
