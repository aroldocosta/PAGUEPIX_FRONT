import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { PayoutService } from '../../../core/services/payout.service';
import { Payout } from '../../../core/models/payout.model';

@Component({
    selector: 'app-payouts-management',
    standalone: true,
    imports: [CommonModule, ManagementLayoutComponent],
    templateUrl: './payouts.html',
    styleUrl: './payouts.scss'
})
export class PayoutsManagement implements OnInit {
    payouts = signal<Payout[]>([]);
    loading = signal(true);
    currentPage = signal(0);
    totalPages = signal(1);
    hasData = computed(() => this.payouts().length > 0);

    constructor(private payoutService: PayoutService) { }

    ngOnInit() {
        this.loadPayouts();
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
}
