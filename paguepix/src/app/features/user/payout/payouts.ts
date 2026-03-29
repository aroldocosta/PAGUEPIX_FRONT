import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PayoutDetailComponent } from '../../../shared/components/payouts/payout-detail/payout-detail.component';
import { PayoutService } from '../../../core/services/payout.service';
import { Payout } from '../../../core/models/payout.model';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-partner-payouts',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent, PayoutDetailComponent],
    templateUrl: './payouts.html',
    styleUrl: './payouts.scss'
})
export class PartnerPayouts implements OnInit {
    private authService = inject(AuthService);
    partnerName = computed(() => this.authService.partnerName());
    partnerLogo = computed(() => this.authService.partnerLogo());
    imageError = signal(false);

    logoUrl = computed(() => {
        const logo = this.partnerLogo();
        if (!logo) return null;
        return `${environment.apiUrl}/partners/${this.authService.partnerId()}/logo`;
    });

    payouts = signal<Payout[]>([]);
    selectedPayout = signal<Payout | null>(null);
    loading = signal(false);
    currentPage = signal(0);
    totalPages = signal(1);

    constructor(private payoutService: PayoutService) { }

    ngOnInit() {
        this.loadPayouts();
    }

    onViewPayout(payout: Payout) {
        this.selectedPayout.set(payout);
    }

    loadPayouts() {
        this.loading.set(true);
        this.payoutService.getAll(undefined, this.currentPage(), 10).subscribe({
            next: (response) => {
                this.payouts.set(response.content || response);
                this.totalPages.set(response.totalPages || 1);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading payouts', err);
                this.loading.set(false);
            }
        });
    }

    nextPage() {
        if (this.currentPage() < this.totalPages() - 1) {
            this.currentPage.update(p => p + 1);
            this.loadPayouts();
        }
    }

    prevPage() {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadPayouts();
        }
    }

    getStatusClass(status: string) {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/10';
            case 'PAID_OUT':
                return 'bg-green-50 text-green-700 ring-1 ring-green-600/10';
            case 'FAILED':
                return 'bg-red-50 text-red-700 ring-1 ring-red-600/10';
            default:
                return 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/10';
        }
    }

    getStatusIconClass(status: string) {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-yellow-600';
            case 'PAID_OUT':
                return 'bg-green-600';
            case 'FAILED':
                return 'bg-red-600';
            default:
                return 'bg-gray-600';
        }
    }

    formatDate(dateString: string) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch (e) {
            return dateString;
        }
    }

    formatTime(dateString: string) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    }

    openNewPayout() {
        console.log('Abrir fluxo de novo saque');
        // Implementação futura do fluxo de saque
    }
}
