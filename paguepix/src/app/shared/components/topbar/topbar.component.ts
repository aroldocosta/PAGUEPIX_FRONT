import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
    protected authService = inject(AuthService);
    protected themeService = inject(ThemeService);

    searchPlaceholder = input<string>('Buscar...');

    userName = computed(() => this.authService.name());
    userRole = computed(() => {
        const role = this.authService.role();
        if (role === 'ADMIN') return 'Super Admin';
        if (role === 'USER') return 'Parceiro';
        return role || '';
    });
}
