import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payments-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments-management.html',
  styleUrl: './payments-management.scss'
})
export class PaymentsManagement {
  payments = signal([
    { id: 'TXN-9012', partner: 'Loja Central', amount: 450.00, date: '2024-02-22 10:30', status: 'Success' },
    { id: 'TXN-9013', partner: 'Mercado Silva', amount: 125.50, date: '2024-02-22 11:15', status: 'Pending' },
    { id: 'TXN-9014', partner: 'Farmácia Viva', amount: 89.90, date: '2024-02-22 11:45', status: 'Success' },
    { id: 'TXN-9015', partner: 'Auto Posto Norte', amount: 200.00, date: '2024-02-22 12:00', status: 'Failed' },
  ]);
}
