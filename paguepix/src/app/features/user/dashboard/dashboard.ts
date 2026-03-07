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
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, SalesChartComponent, SidebarComponent, TopbarComponent, FooterComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class UserDashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  protected themeService = inject(ThemeService);

  userName = computed(() => this.authService.name());
  partnerName = computed(() => this.authService.partnerName());

  // Cards
  balance = signal(0);
  todaySales = signal(0);
  averageTicket = signal(0);

  // Data from API
  salesOverviewData = signal<DailySales[]>([]);

  // Table
  recentTxns = signal<{
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

  private loadDashboard(): void {
    this.loading.set(true);
    this.dashboardService.getStats(this.selectedDays()).subscribe({
      next: (data: DashboardData) => {
        this.balance.set(data.availableBalance);
        this.todaySales.set(data.totalTransacted);

        // Ticket médio agora vem do backend
        this.averageTicket.set(data.averageTicket);

        this.salesOverviewData.set(data.salesOverview);

        this.recentTxns.set(
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
