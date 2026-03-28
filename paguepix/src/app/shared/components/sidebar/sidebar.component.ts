import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
    animations: [
        trigger('accordion', [
            state('open', style({ height: '*', opacity: 1, overflow: 'hidden' })),
            state('closed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
            transition('closed => open', [animate('600ms ease-in-out')]),
            transition('open => closed', [animate('600ms ease-in-out')]),
        ])
    ]
})
export class SidebarComponent {
    private authService = inject(AuthService);
    private menuService = inject(MenuService);
    private router = inject(Router);

    menuCategories = this.menuService.menuCategories;
    activeCategory = signal<string | null>(null);

    constructor() {
        // Inicializa categoria ativa com base na rota atual
        const currentRoute = this.router.url;
        const active = this.menuCategories().find(cat =>
            cat.items.some(item => item.route === currentRoute)
        );
        if (active) {
            this.activeCategory.set(active.label);
        }
    }

    toggleCategory(label: string) {
        this.activeCategory.update(current => current === label ? null : label);
    }

    logout() {
        this.authService.logout();
    }

    isActive(route: string): boolean {
        return this.router.url === route;
    }
}
