import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class UserDashboard {
  private authService = inject(AuthService);
  protected themeService = inject(ThemeService);
  userName = computed(() => this.authService.name());
  balance = signal(12430.50);
  todaySales = signal(1500.00);
  averageTicket = signal(125.00);

  chartData = signal([
    { day: 'MON', value: 20 },
    { day: 'TUE', value: 35 },
    { day: 'WED', value: 25 },
    { day: 'THU', value: 50 },
    { day: 'FRI', value: 40 },
    { day: 'SAT', value: 60 },
    { day: 'SUN', value: 30 },
  ]);

  recentTxns = signal([
    { id: '#PX-UX120', customer: 'João Silva', initials: 'JS', avatarBg: 'bg-gray-100', date: 'Today, 11:20', amount: 450.00, status: 'CONFIRMED' },
    { id: '#PX-UX119', customer: 'Maria Oliveira', initials: 'MO', avatarBg: 'bg-purple-100', date: 'Today, 09:45', amount: 125.50, status: 'PENDING' },
    { id: '#PX-UX118', customer: 'Ricardo Lima', initials: 'RL', avatarBg: 'bg-indigo-100', date: 'Yesterday, 18:30', amount: 890.00, status: 'CONFIRMED' },
  ]);

  logout() {
    this.authService.logout();
  }
}
