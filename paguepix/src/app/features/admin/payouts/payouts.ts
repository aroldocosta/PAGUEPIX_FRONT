import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { PayoutService } from '../../../core/services/payout.service';
import { PartnerService } from '../../../core/services/partner.service';
import { Partner } from '../../../core/models/partner.model';
import { Payout } from '../../../core/models/payout.model';
import { PayoutDetailComponent } from '../../../shared/components/payouts/payout-detail/payout-detail.component';

@Component({
    selector: 'app-payouts-management',
    standalone: true,
    imports: [CommonModule, ManagementLayoutComponent, PayoutDetailComponent, FormsModule],
    templateUrl: './payouts.html',
    styleUrl: './payouts.scss'
})
export class PayoutsManagement implements OnInit {
    payouts = signal<Payout[]>([]);
    partners = signal<Partner[]>([]);
    selectedPayout = signal<Payout | null>(null);
    selectedPartnerId = signal<string | number>('all');
    loading = signal(false);
    currentPage = signal(0);
    totalPages = signal(0);
    hasData = computed(() => this.payouts().length > 0);

    private payoutService = inject(PayoutService);
    private partnerService = inject(PartnerService);

    ngOnInit() {
        this.loadPartners();
        this.loadPayouts();
    }

    loadPartners() {
        this.partnerService.getAll(0, 100).subscribe({
            next: (resp) => this.partners.set(resp.content || resp),
            error: (err) => console.error('Error loading partners', err)
        });
    }

    onPartnerChange() {
        this.currentPage.set(0);
        this.loadPayouts();
    }

    onViewPayout(payout: Payout) {
        this.selectedPayout.set(payout);
    }

    loadPayouts() {
        this.loading.set(true);
        const partnerId = this.selectedPartnerId() === 'all' ? undefined : this.selectedPartnerId().toString();
        this.payoutService.getAll(partnerId, this.currentPage(), 10).subscribe({
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
}
