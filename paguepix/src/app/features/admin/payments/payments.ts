import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentListComponent } from '../../../shared/components/payments/payment-list/payment-list.component';
import { PaymentDetailComponent } from '../../../shared/components/payments/payment-detail/payment-detail.component';
import { Payment } from '../../../core/models/payment.model';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, ManagementLayoutComponent, PaymentListComponent, PaymentDetailComponent],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class PaymentsManagement implements OnInit {
  payments = signal<Payment[]>([]);
  loading = signal(false);
  currentPage = signal(0);
  totalPages = signal(0);
  hasData = signal(true);
  selectedPayment = signal<Payment | null>(null);

  constructor(private paymentService: PaymentService) { }

  ngOnInit() {
    this.loadPayments();
  }

  onViewPayment(payment: Payment) {
    this.selectedPayment.set(payment);
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
