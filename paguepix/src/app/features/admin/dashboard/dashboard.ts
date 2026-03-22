import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { DashboardService, DashboardData } from '../../../core/services/dashboard.service';
import { SalesChartComponent, DailySales } from '../../../shared/components/sales-chart/sales-chart.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SalesChartComponent, SidebarComponent, TopbarComponent, FooterComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  protected themeService = inject(ThemeService);

  userName = computed(() => this.authService.name());
  partnerName = computed(() => this.authService.partnerName());

  // Cards — período atual
  availableBalance = signal(0);
  totalTransacted = signal({ gross: 0, fee: 0, net: 0 });
  completedPayouts = signal(0);

  // Cards — período anterior (retornados pelo backend)
  prevAvailableBalance = signal(0);
  prevTotalTransacted = signal({ gross: 0, fee: 0, net: 0 });
  prevCompletedPayouts = signal(0);

  // Tendências calculadas (cada card com sua própria base de comparação)
  balanceTrend = computed(() => this.calcTrend(this.prevAvailableBalance(), this.availableBalance()));
  revenueTrend = computed(() => this.calcTrend(this.prevTotalTransacted().gross, this.totalTransacted().gross));
  payoutsTrend = computed(() => this.calcTrend(this.prevCompletedPayouts(), this.completedPayouts()));

  // Dados do gráfico
  salesOverviewData = signal<DailySales[]>([]);

  // Tabela
  recentTransactions = signal<{
    id: string; partner: string; initials: string;
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

  /** Calcula % de variação entre período anterior e atual. */
  calcTrend(prev: number, curr: number): number {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  }

  /** Formata o valor de tendência com sinal e 1 decimal. */
  trendLabel(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  /** Classe CSS do badge conforme direção da tendência. */
  trendClass(value: number): string {
    if (value > 0) return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    if (value < 0) return 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
  }

  /** Ícone de tendência. */
  trendIcon(value: number): string {
    if (value > 0) return 'trending_up';
    if (value < 0) return 'trending_down';
    return 'trending_flat';
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.dashboardService.getStats(this.selectedDays()).subscribe({
      next: (data: DashboardData) => {
        this.availableBalance.set(data.availableBalance);
        this.totalTransacted.set(data.totalTransacted || { gross: 0, fee: 0, net: 0 });
        this.completedPayouts.set(data.completedPayouts);

        this.prevAvailableBalance.set(data.previousAvailableBalance ?? 0);
        this.prevTotalTransacted.set(data.previousTotalTransacted || { gross: 0, fee: 0, net: 0 });
        this.prevCompletedPayouts.set(data.previousCompletedPayouts ?? 0);

        this.salesOverviewData.set(data.salesOverview);

        this.recentTransactions.set(
          data.recentTransactions.map((tx, i) => ({
            id: tx.id,
            partner: tx.partner,
            initials: this.initials(tx.partner),
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
