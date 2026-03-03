import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-payments-management',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class PaymentsManagement implements OnInit {
  payments = signal<any[]>([]);
  loading = signal(true);
  currentPage = signal(0);
  totalPages = signal(1);

  constructor(private paymentService: PaymentService) { }

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.loading.set(true);
    this.paymentService.getAll(undefined, this.currentPage(), 10).subscribe({
      next: (response) => {
        this.payments.set(response.content || response);
        this.totalPages.set(response.totalPages || 1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading payments', err);
        this.loading.set(false);
      }
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadPayments();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadPayments();
    }
  }
}
