import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { DashboardService, DashboardData } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.scss',
})
export class HomeDashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  protected themeService = inject(ThemeService);

  userName = computed(() => this.authService.name());

  // Cards
  availableBalance = signal(0);
  totalTransacted = signal(0);
  pendingPayouts = signal(0);

  // Chart
  chartData = signal<{ day: string; value: number }[]>([]);

  // Table
  recentTransactions = signal<{
    id: string; customer: string; initials: string;
    avatarBg: string; date: string; amount: number; status: string;
  }[]>([]);

  selectedDays = signal(7);
  loading = signal(false);

  private readonly AVATAR_COLORS = [
    'bg-gray-100', 'bg-purple-100', 'bg-indigo-100', 'bg-rose-100', 'bg-green-100'
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  selectPeriod(days: number): void {
    this.selectedDays.set(days);
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.dashboardService.getStats(this.selectedDays()).subscribe({
      next: (data: DashboardData) => {
        this.availableBalance.set(data.availableBalance);
        this.totalTransacted.set(data.totalTransacted);
        this.pendingPayouts.set(data.pendingPayouts);

        // Normalizar chart: percentual relativo ao maior valor do período
        const maxAmount = Math.max(...data.salesOverview.map(s => s.amount), 1);
        this.chartData.set(
          data.salesOverview.map(s => ({
            day: s.date,
            value: Math.round((s.amount / maxAmount) * 85)
          }))
        );

        this.recentTransactions.set(
          data.recentTransactions.map((tx, i) => ({
            id: tx.id,
            customer: tx.customer,
            initials: this.initials(tx.customer),
            avatarBg: this.AVATAR_COLORS[i % this.AVATAR_COLORS.length],
            date: tx.date,
            amount: tx.amount,
            status: tx.status
          }))
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private initials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
