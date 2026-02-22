import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-payments-history',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payments-history.html',
    styleUrl: './payments-history.scss'
})
export class PaymentsHistory {
    history = signal([
        { id: '12891', date: '22 Feb 2024, 14:05', amount: 350.00, fees: 3.50 },
        { id: '12890', date: '22 Feb 2024, 13:42', amount: 15.00, fees: 0.15 },
        { id: '12889', date: '22 Feb 2024, 12:15', amount: 1250.00, fees: 12.50 },
        { id: '12888', date: '21 Feb 2024, 18:20', amount: 89.90, fees: 0.90 },
        { id: '12887', date: '21 Feb 2024, 17:05', amount: 200.00, fees: 2.00 },
    ]);
}
