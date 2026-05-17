import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentSummary } from '../../../../core/models/payment.model';

@Component({
    selector: 'app-payment-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-list.component.html',
    styleUrl: './payment-list.component.scss'
})
export class PaymentListComponent {
    @Input() payments: PaymentSummary[] = [];
    @Input() mode: 'admin' | 'user' = 'admin';
    @Output() view = new EventEmitter<PaymentSummary>();

    onView(payment: PaymentSummary) {
        this.view.emit(payment);
    }
}
