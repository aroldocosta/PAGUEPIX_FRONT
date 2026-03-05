import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
    label: string;
    icon: string;
    route: string;
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
    private authService = inject(AuthService);
    private router = inject(Router);


    userRole = this.authService.role;

    adminMenuItems: MenuItem[] = [
        { label: 'Dashboard', icon: 'home', route: '/admin/dashboard' },
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
        return this.userRole() === 'ADMIN' ? this.adminMenuItems : this.userMenuItems;
    });

    logout() {
        this.authService.logout();
    }

    isActive(route: string): boolean {
        return this.router.url === route;
    }
}
