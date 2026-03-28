import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';


@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
    private authService = inject(AuthService);
    private menuService = inject(MenuService);
    private router = inject(Router);

    menuCategories = this.menuService.menuCategories;
    expandedCategories = signal<Set<string>>(new Set());

    constructor() {
        // Inicializa categorias expandidas com base na rota atual
        const currentRoute = this.router.url;
        this.menuCategories().forEach(cat => {
            if (cat.items.some(item => item.route === currentRoute)) {
                this.expandedCategories.update(set => {
                    const newSet = new Set(set);
                    newSet.add(cat.label);
                    return newSet;
                });
            }
        });
    }

    toggleCategory(label: string) {
        this.expandedCategories.update(set => {
            const newSet = new Set(set);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    }

    logout() {
        this.authService.logout();
    }

    isActive(route: string): boolean {
        return this.router.url === route;
    }
}
