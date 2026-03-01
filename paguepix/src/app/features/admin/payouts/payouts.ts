import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PayoutService } from '../../../core/services/payout.service';
import { Payout } from '../../../core/models/payout.model';

@Component({
    selector: 'app-payouts-management',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './payouts.html',
    styleUrl: './payouts.scss'
})
export class PayoutsManagement implements OnInit {
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
}
