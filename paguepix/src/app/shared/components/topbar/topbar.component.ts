import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { MobileDrawerComponent } from '../mobile-drawer/mobile-drawer.component';



@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, RouterModule, MobileDrawerComponent],
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

    dashboardRoute = computed(() =>
        this.authService.role() === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'
    );
}
