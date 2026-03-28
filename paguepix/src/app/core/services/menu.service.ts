import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export interface MenuItem {
    label: string;
    icon: string;
    route: string;
    disabled?: boolean;
}

export interface MenuCategory {
    label: string;
    icon: string;
    items: MenuItem[];
}

@Injectable({ providedIn: 'root' })
export class MenuService {
    private authService = inject(AuthService);

    readonly adminMenuCategories: MenuCategory[] = [
        {
            label: 'RESULTADOS',
            icon: 'analytics',
            items: [
                { label: 'Dashboard', icon: 'home', route: '/admin/dashboard' },
                { label: 'Estatísticas', icon: 'query_stats', route: '/admin/statistics' },
                { label: 'Logs', icon: 'history', route: '#', disabled: true },
            ]
        },
        {
            label: 'NEGÓCIOS',
            icon: 'business_center',
            items: [
                { label: 'Leads', icon: 'person_add', route: '/admin/leads' },
                { label: 'Parceiros', icon: 'handshake', route: '/admin/partners' },
                { label: 'Produtos', icon: 'local_offer', route: '/admin/products' },
            ]
        },
        {
            label: 'FINANCEIRO',
            icon: 'account_balance_wallet',
            items: [
                { label: 'Pagamentos', icon: 'payments', route: '/admin/payments' },
                { label: 'Saques', icon: 'account_balance', route: '/admin/payouts' },
                { label: 'Relatórios', icon: 'analytics', route: '#', disabled: true },
            ]
        },
        {
            label: 'USUÁRIOS',
            icon: 'people_alt',
            items: [
                { label: 'Usuários', icon: 'group', route: '/admin/users' },
                { label: 'Permissões', icon: 'manage_accounts', route: '#', disabled: true },
            ]
        },
        {
            label: 'HARDWARE',
            icon: 'memory',
            items: [
                { label: 'Devices', icon: 'devices', route: '/admin/devices' },
                { label: 'Placas', icon: 'memory', route: '/admin/boards' },
                { label: 'Scripts', icon: 'code', route: '/admin/scripts' },
                { label: 'Monitoramento', icon: 'sensors', route: '#', disabled: true },
            ]
        }
    ];

    readonly userMenuCategories: MenuCategory[] = [
        {
            label: 'Menu',
            icon: 'menu',
            items: [
                { label: 'Dashboard', icon: 'home', route: '/user/dashboard' },
                { label: 'Saques', icon: 'account_balance', route: '/user/payout' },
                { label: 'Vendas', icon: 'history', route: '/user/sales' },
                { label: 'Devices', icon: 'devices', route: '/user/devices' },
            ]
        }
    ];

    readonly menuCategories = computed(() =>
        this.authService.role() === 'ADMIN'
            ? this.adminMenuCategories
            : this.userMenuCategories
    );
}
