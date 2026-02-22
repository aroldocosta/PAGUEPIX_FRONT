import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.scss',
})
export class HomeDashboard {
  private authService = inject(AuthService);
  protected themeService = inject(ThemeService);
  userName = computed(() => this.authService.name());
  availableBalance = signal(124500.00);
  totalTransacted = signal(842105.20);
  pendingPayouts = signal(5120.00);

  chartData = signal([
    { day: 'MON', value: 30 },
    { day: 'TUE', value: 45 },
    { day: 'WED', value: 38 },
    { day: 'THU', value: 65 },
    { day: 'FRI', value: 52 },
    { day: 'SAT', value: 85 },
    { day: 'SUN', value: 40 },
  ]);

  recentTransactions = signal([
    { id: '#PX-94120', customer: 'João Silva', initials: 'JS', avatarBg: 'bg-gray-100', date: 'Hoje, 10:45', amount: 250.00, status: 'CONFIRMED' },
    { id: '#PX-94119', customer: 'Maria Oliveira', initials: 'MO', avatarBg: 'bg-purple-100', date: 'Hoje, 10:32', amount: 1200.50, status: 'PENDING' },
    { id: '#PX-94118', customer: 'Ricardo Lima', initials: 'RL', avatarBg: 'bg-indigo-100', date: 'Hoje, 09:15', amount: 45.90, status: 'CONFIRMED' },
    { id: '#PX-94117', customer: 'Ana Beatriz', initials: 'AB', avatarBg: 'bg-rose-100', date: 'Hoje, 08:50', amount: 300.00, status: 'FAILED' },
  ]);

  logout() {
    this.authService.logout();
  }
}
