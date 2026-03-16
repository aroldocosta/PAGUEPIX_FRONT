import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Payment } from '../../../../core/models/payment.model';

@Component({
    selector: 'app-payment-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-list.component.html',
    styleUrl: './payment-list.component.scss'
})
export class PaymentListComponent {
    @Input() payments: Payment[] = [];
    @Input() mode: 'admin' | 'user' = 'admin';
    @Output() view = new EventEmitter<Payment>();

    onView(payment: Payment) {
        this.view.emit(payment);
    }
}
