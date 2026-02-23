import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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

    userName = this.authService.name;
    userRole = this.authService.role;

    adminMenuItems: MenuItem[] = [
        { label: 'Painel', icon: 'dashboard', route: '/admin/dashboard' },
        { label: 'Pagamentos', icon: 'payments', route: '/admin/payments' },
        { label: 'Usuários', icon: 'group', route: '/admin/users' },
    ];

    userMenuItems: MenuItem[] = [
        { label: 'Painel', icon: 'dashboard', route: '/user/dashboard' },
        { label: 'Transferências', icon: 'account_balance', route: '/user/transfer' },
        { label: 'Histórico', icon: 'history', route: '/user/history' },
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
