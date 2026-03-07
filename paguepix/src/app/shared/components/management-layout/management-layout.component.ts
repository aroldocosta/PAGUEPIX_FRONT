import { Component, Input, ContentChild, TemplateRef, Signal, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-management-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './management-layout.component.html'
})
export class ManagementLayoutComponent {
    private authService = inject(AuthService);
    partnerName = computed(() => this.authService.partnerName());
    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() searchPlaceholder: string = 'Buscar...';
    @Input() addButtonLabel: string = '';
    @Input() addButtonIcon: string = 'add';
    @Input() addRoute: string = '';
    @Input() loading: Signal<boolean> = signal(false);
    @Input() hasData: Signal<boolean> = signal(false);
    @Input() emptyStateIcon: string = 'search_off';
    @Input() emptyStateMessage: string = 'Nenhum registro encontrado.';

    @ContentChild('tableHeader') tableHeader?: TemplateRef<any>;
    @ContentChild('tableRow') tableRow?: TemplateRef<any>;
    @ContentChild('tableContent') tableContent?: TemplateRef<any>;
}
