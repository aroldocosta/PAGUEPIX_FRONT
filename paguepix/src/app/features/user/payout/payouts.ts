import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PayoutService } from '../../../core/services/payout.service';
import { Payout } from '../../../core/models/payout.model';

@Component({
    selector: 'app-partner-payouts',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './payouts.html',
    styleUrl: './payouts.scss'
})
export class PartnerPayouts implements OnInit {
    payouts = signal<Payout[]>([]);
    loading = signal(true);

    constructor(private payoutService: PayoutService) { }

    ngOnInit() {
        this.loadPayouts();
    }

    loadPayouts() {
        this.loading.set(true);
        this.payoutService.getAll().subscribe({
            next: (response) => {
                this.payouts.set(response.content || response);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading payouts', err);
                this.loading.set(false);
            }
        });
    }

    getStatusClass(status: string) {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/10';
            case 'TRANSFERRED':
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
            case 'TRANSFERRED':
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
}
