import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { StatisticsService, StatisticsData, PeriodSales } from '../../../core/services/statistics';
import { PartnerService } from '../../../core/services/partner.service';
import { Partner } from '../../../core/models/partner.model';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, FooterComponent],
  providers: [DatePipe],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss',
})
export class Statistics implements OnInit {
  private authService = inject(AuthService);
  private statisticsService = inject(StatisticsService);
  private partnerService = inject(PartnerService);
  private datePipe = inject(DatePipe);
  protected themeService = inject(ThemeService);

  userName = computed(() => this.authService.name());
  partnerName = computed(() => this.authService.partnerName());

  // Partners list for the dropdown filter
  partners = signal<Partner[]>([]);
  selectedPartnerId = signal<number | string | null>(null);

  // Period filters
  periods = [
    { label: 'Este Ano', value: 'this_year' },
    { label: 'Últimos 6 Meses', value: 'last_6_months' },
    { label: 'Trimestre Anterior', value: 'last_quarter' }
  ];
  selectedPeriod = signal('this_year');

  // Stats
  availableBalance = signal(0);
  totalTransacted = signal(0);
  completedPayouts = signal(0);
  salesOverviewData = signal<PeriodSales[]>([]);

  loading = signal(false);

  ngOnInit(): void {
    this.loadPartners();
    this.loadStatistics();
  }

  private loadPartners(): void {
    this.partnerService.getAll(0, 1000).subscribe({
      next: (data: any) => {
        // Assume getAll returns a paginated structure { content: [] }
        this.partners.set(data.content || data);
      }
    });
  }

  onFilterChange(): void {
    this.loadStatistics();
  }

  private calculateDateRange(): { startDate: string, endDate: string } {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (this.selectedPeriod()) {
      case 'this_year':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case 'last_6_months':
        start = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        break;
      case 'last_quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), (currentQuarter - 1) * 3, 1);
        end = new Date(today.getFullYear(), currentQuarter * 3, 0);
        break;
    }

    return {
      startDate: this.datePipe.transform(start, 'yyyy-MM-dd')!,
      endDate: this.datePipe.transform(end, 'yyyy-MM-dd')!
    };
  }

  private loadStatistics(): void {
    this.loading.set(true);
    const { startDate, endDate } = this.calculateDateRange();
    const currentPartnerId = this.selectedPartnerId();
    const partnerId = currentPartnerId != null ? currentPartnerId : undefined;

    this.statisticsService.getStatistics(startDate, endDate, partnerId).subscribe({
      next: (data: StatisticsData) => {
        this.availableBalance.set(data.availableBalance);
        this.totalTransacted.set(data.totalTransacted);
        this.completedPayouts.set(data.completedPayouts);
        this.salesOverviewData.set(data.salesOverview);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
