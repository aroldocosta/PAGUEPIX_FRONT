import { Component, inject } from '@angular/core';
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

    menuItems = this.menuService.menuItems;

    logout() {
        this.authService.logout();
    }

    isActive(route: string): boolean {
        return this.router.url === route;
    }
}
