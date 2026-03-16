import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Payment } from '../../../../core/models/payment.model';

@Component({
    selector: 'app-payment-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-detail.component.html',
    styleUrl: './payment-detail.component.scss'
})
export class PaymentDetailComponent {
    @Input({ required: true }) payment!: Payment;
    @Input() mode: 'admin' | 'user' = 'user';
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}
