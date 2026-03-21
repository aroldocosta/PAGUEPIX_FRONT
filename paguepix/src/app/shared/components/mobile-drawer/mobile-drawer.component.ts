import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';

@Component({
    selector: 'app-mobile-drawer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mobile-drawer.component.html',
})
export class MobileDrawerComponent {
    private authService = inject(AuthService);
    private menuService = inject(MenuService);
    private router = inject(Router);

    /** Controla se o drawer está aberto */
    open = input.required<boolean>();

    /** Emite ao solicitar fechamento (backdrop, botão × ou item clicado) */
    close = output<void>();

    userName = computed(() => this.authService.name());
    partnerName = computed(() => {
        const partner = this.authService.partnerName();
        const role = this.authService.role();
        if (partner && partner.trim() !== '') return partner;
        if (role === 'ADMIN') return 'Super Admin';
        if (role === 'USER') return 'Parceiro';
        return role || '';
    });

    menuItems = this.menuService.menuItems;

    isActive(route: string): boolean {
        return this.router.url === route;
    }

    navigate(route: string) {
        this.router.navigate([route]);
        this.close.emit();
    }

    logout() {
        this.authService.logout();
        this.close.emit();
    }

    onClose() {
        this.close.emit();
    }
}
