import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class UserDashboard {
  balance = signal(12430.50);
  todaySales = signal(1500.00);
  recentTxns = signal([
    { date: 'Today, 11:20', amount: 450.00 },
    { date: 'Today, 09:45', amount: 125.50 },
    { date: 'Yesterday, 18:30', amount: 890.00 },
  ]);

  requestPayout() {
    console.log('Navigating to payout request...');
  }
}
