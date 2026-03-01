import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { Sale } from '../../../core/models/sale.model';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
    selector: 'app-sales',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './sales.html',
    styleUrl: './sales.scss'
})
export class SalesComponent implements OnInit {
    private paymentService = inject(PaymentService);

    sales = signal<Sale[]>([]);
    loading = signal(false);

    ngOnInit() {
        this.loadSales();
    }

    loadSales() {
        this.loading.set(true);
        // Assuming partnerId is handled by the auth interceptor or service context
        this.paymentService.getAll().subscribe({
            next: (response) => {
                this.sales.set(response.content || response);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading sales:', err);
                this.loading.set(false);
            }
        });
    }
}
