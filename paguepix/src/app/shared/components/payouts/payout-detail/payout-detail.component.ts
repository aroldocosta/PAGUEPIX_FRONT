import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Payout } from '../../../../core/models/payout.model';

@Component({
    selector: 'app-payout-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payout-detail.component.html',
    styleUrl: './payout-detail.component.scss'
})
export class PayoutDetailComponent {
    @Input({ required: true }) payout!: Payout;
    @Input() mode: 'admin' | 'user' = 'user';
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}
