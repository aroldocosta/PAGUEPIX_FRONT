import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { PaymentService } from '../../../core/services/payment.service';
import { PartnerService } from '../../../core/services/partner.service';
import { PaymentListComponent } from '../../../shared/components/payments/payment-list/payment-list.component';
import { PaymentDetailComponent } from '../../../shared/components/payments/payment-detail/payment-detail.component';
import { PaymentSummary, PaymentDetail } from '../../../core/models/payment.model';
import { Partner } from '../../../core/models/partner.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, ManagementLayoutComponent, PaymentListComponent, PaymentDetailComponent, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class PaymentsManagement implements OnInit {
  payments = signal<PaymentSummary[]>([]);
  partners = signal<Partner[]>([]);
  selectedPartnerId = signal<string | number>('all');
  loading = signal(false);
  currentPage = signal(0);
  totalPages = signal(0);
  hasData = signal(true);
  selectedPayment = signal<PaymentDetail | null>(null);

  constructor(
    private paymentService: PaymentService,
    private partnerService: PartnerService
  ) { }

  ngOnInit() {
    this.loadPartners();
    this.loadPayments();
  }

  loadPartners() {
    this.partnerService.getAll(0, 100).subscribe({
      next: (resp) => this.partners.set(resp.content || resp),
      error: (err) => console.error('Error loading partners', err)
    });
  }

  onPartnerChange() {
    this.currentPage.set(0);
    this.loadPayments();
  }

  onViewPayment(payment: PaymentSummary) {
    this.paymentService.getById(payment.id).subscribe({
      next: (detailed) => this.selectedPayment.set(detailed),
      error: (err) => console.error('Error loading payment details', err)
    });
  }

  loadPayments() {
    this.loading.set(true);
    const partnerId = this.selectedPartnerId() === 'all' ? undefined : this.selectedPartnerId().toString();

    this.paymentService.getAll(partnerId, this.currentPage(), 10).subscribe({
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
