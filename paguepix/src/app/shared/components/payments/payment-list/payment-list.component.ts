import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentSummary } from '../../../../core/models/payment.model';

export type SortDirection = 'asc' | 'desc';

export interface SortEvent {
    field: string;
    direction: SortDirection;
}

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
    @Input() sortField: string = 'time';
    @Input() sortDirection: SortDirection = 'desc';

    @Output() view = new EventEmitter<PaymentSummary>();
    @Output() sortChange = new EventEmitter<SortEvent>();

    onView(payment: PaymentSummary) {
        this.view.emit(payment);
    }

    onSort(field: string) {
        let direction: SortDirection;
        if (this.sortField === field) {
            direction = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            direction = (field === 'time' || field === 'paidValue' || field === 'id') ? 'desc' : 'asc';
        }
        this.sortChange.emit({ field, direction });
    }
}
