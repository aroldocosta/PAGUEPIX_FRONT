import { Component, signal, computed, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { Sale } from '../../../core/models/sale.model';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentListComponent } from '../../../shared/components/payments/payment-list/payment-list.component';
import { PaymentDetailComponent } from '../../../shared/components/payments/payment-detail/payment-detail.component';
import { PaymentSummary, PaymentDetail } from '../../../core/models/payment.model';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-sales',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent, PaymentListComponent, PaymentDetailComponent],
    templateUrl: './sales.html',
    styleUrl: './sales.scss'
})
export class SalesComponent implements OnInit {
    private paymentService = inject(PaymentService);
    private authService = inject(AuthService);

    partnerName = computed(() => this.authService.partnerName());
    partnerLogo = computed(() => this.authService.partnerLogo());
    imageError = signal(false);

    logoUrl = computed(() => {
        const logo = this.partnerLogo();
        if (!logo) return null;
        return `${environment.apiUrl}/partners/${this.authService.partnerId()}/logo`;
    });

    sales = signal<PaymentSummary[]>([]);
    selectedPayment = signal<PaymentDetail | null>(null);
    loading = signal(false);
    currentPage = signal(0);
    totalPages = signal(1);
    sortField = signal<string>('time');
    sortDirection = signal<'asc' | 'desc'>('desc');

    ngOnInit() {
        this.loadSales();
    }

    onViewPayment(payment: PaymentSummary) {
        this.paymentService.getById(payment.id).subscribe({
            next: (detailedPayment) => this.selectedPayment.set(detailedPayment),
            error: (err) => console.error('Error loading payment details', err)
        });
    }

    onSortChange(event: { field: string, direction: 'asc' | 'desc' }) {
        this.sortField.set(event.field);
        this.sortDirection.set(event.direction);
        this.currentPage.set(0);
        this.loadSales();
    }

    loadSales() {
        this.loading.set(true);
        const sortParam = `${this.sortField()},${this.sortDirection()}`;
        this.paymentService.getAll(undefined, this.currentPage(), 10, sortParam).subscribe({
            next: (response) => {
                this.sales.set(response.content || response);
                this.totalPages.set(response.totalPages || 1);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading sales:', err);
                this.loading.set(false);
            }
        });
    }

    nextPage() {
        if (this.currentPage() < this.totalPages() - 1) {
            this.currentPage.update(p => p + 1);
            this.loadSales();
        }
    }

    prevPage() {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadSales();
        }
    }

    @HostListener('document:visibilitychange', [])
    onVisibilityChange() {
        if (document.visibilityState === 'visible') {
            console.log('Sales page became visible, refreshing sales list...');
            this.loadSales();
        }
    }
}
