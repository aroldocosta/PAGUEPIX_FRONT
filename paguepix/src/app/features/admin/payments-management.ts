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
    { id: '#PX-1025', partner: 'Loja Central', amount: 450.00, date: 'Feb 22, 10:30', status: 'Success', method: 'Pix' },
    { id: '#PX-1026', partner: 'Mercado Silva', amount: 125.50, date: 'Feb 22, 11:15', status: 'Pending', method: 'Pix' },
    { id: '#PX-1027', partner: 'Farmácia Viva', amount: 89.90, date: 'Feb 22, 11:45', status: 'Success', method: 'Pix' },
    { id: '#PX-1028', partner: 'Auto Posto Norte', amount: 200.00, date: 'Feb 22, 12:00', status: 'Failed', method: 'Pix' },
    { id: '#PX-1029', partner: 'Padaria Pão Quente', amount: 15.50, date: 'Feb 22, 12:30', status: 'Success', method: 'Pix' },
    { id: '#PX-1030', partner: 'Restaurante Sabor', amount: 320.00, date: 'Feb 22, 13:00', status: 'Success', method: 'Pix' },
  ]);
}
