import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

interface MenuItem {
    label: string;
    icon: string;
    route: string;
}

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
    protected authService = inject(AuthService);
    protected themeService = inject(ThemeService);
    private router = inject(Router);

    searchPlaceholder = input<string>('Buscar...');

    userName = computed(() => this.authService.name());
    partnerName = computed(() => {
        const partner = this.authService.partnerName();
        const role = this.authService.role();

        if (partner && partner.trim() !== '') {
            return partner;
        }

        if (role === 'ADMIN') return 'Super Admin';
        if (role === 'USER') return 'Parceiro';
        return role || '';
    });

    drawerOpen = signal(false);

    toggleDrawer() {
        this.drawerOpen.update(v => !v);
    }

    closeDrawer() {
        this.drawerOpen.set(false);
    }

    adminMenuItems: MenuItem[] = [
        { label: 'Dashboard', icon: 'home', route: '/admin/dashboard' },
        { label: 'Estatísticas', icon: 'query_stats', route: '/admin/statistics' },
        { label: 'Parceiros', icon: 'handshake', route: '/admin/partners' },
        { label: 'Pagamentos', icon: 'payments', route: '/admin/payments' },
        { label: 'Usuários', icon: 'group', route: '/admin/users' },
        { label: 'Devices', icon: 'devices', route: '/admin/devices' },
        { label: 'Placas', icon: 'memory', route: '/admin/boards' },
        { label: 'Scripts', icon: 'code', route: '/admin/scripts' },
        { label: 'Saques', icon: 'account_balance', route: '/admin/payouts' }
    ];

    userMenuItems: MenuItem[] = [
        { label: 'Dashboard', icon: 'home', route: '/user/dashboard' },
        { label: 'Saques', icon: 'account_balance', route: '/user/payout' },
        { label: 'Vendas', icon: 'history', route: '/user/sales' },
    ];

    menuItems = computed(() => {
        return this.authService.role() === 'ADMIN' ? this.adminMenuItems : this.userMenuItems;
    });

    dashboardRoute = computed(() =>
        this.authService.role() === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'
    );

    isActive(route: string): boolean {
        return this.router.url === route;
    }

    navigate(route: string) {
        this.router.navigate([route]);
        this.closeDrawer();
    }

    logout() {
        this.authService.logout();
        this.closeDrawer();
    }
}
