import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { DashboardService, DashboardDetail } from '../../../core/services/dashboard.service';
import { PaymentService } from '../../../core/services/payment.service';
import { SalesChartComponent, DailySales } from '../../../shared/components/sales-chart/sales-chart.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PartnerService } from '../../../core/services/partner.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SalesChartComponent, SidebarComponent, TopbarComponent, FooterComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class UserDashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private paymentService = inject(PaymentService);
  protected themeService = inject(ThemeService);
  private partnerService = inject(PartnerService);
  private http = inject(HttpClient);

  // Signals para Desvinculação com Segurança
  showDisconnectModal = signal(false);
  disconnectLogin = signal('');
  disconnectPassword = signal('');
  disconnectError = signal<string | null>(null);
  isDisconnectingMP = signal(false);

  mpUserId = signal<string | null>(null);
  mpTokenExpiresAt = signal<string | null>(null);
  partnerGatewayName = signal<string | null>(null);
  partnerWorkflowModeLabel = signal<string | null>(null);
  paymentWorkflowMode = computed(() => this.authService.paymentWorkflowMode());

  userName = computed(() => this.authService.name());
  partnerName = computed(() => this.authService.partnerName());
  partnerLogo = computed(() => this.authService.partnerLogo());
  imageError = signal(false);
  
  logoUrl = computed(() => {
    const logo = this.partnerLogo();
    if (!logo) return null;
    return `${environment.apiUrl}/partners/${this.authService.partnerId()}/logo`;
  });

  // Cards — período atual
  balance = signal(0);
  todaySales = signal({ gross: 0, fee: 0, net: 0 });
  averageTicket = signal({ gross: 0, fee: 0, net: 0 });

  // Cards — período anterior
  prevBalance = signal(0);
  prevTodaySales = signal({ gross: 0, fee: 0, net: 0 });
  prevAverageTicket = signal({ gross: 0, fee: 0, net: 0 });

  // Tendências calculadas
  balanceTrend = computed(() => this.calcTrend(this.prevBalance(), this.balance()));
  salesTrend = computed(() => this.calcTrend(this.prevTodaySales().gross, this.todaySales().gross));
  ticketTrend = computed(() => this.calcTrend(this.prevAverageTicket().gross, this.averageTicket().gross));

  // Dados do gráfico
  salesOverviewData = signal<DailySales[]>([]);

  // Tabela
  recentTxns = signal<{
    id: string; partner: string; initials: string;
    avatarBg: string; date: string; amount: number; status: string;
  }[]>([]);

  selectedDays = signal(1);
  loading = signal(false);
  isConnectingMP = signal(false);
  showWithdrawModal = signal(false);
  apiResponseMessage = signal<string | null>(null);
  apiResponseCode = signal<number | null>(null);

  private readonly AVATAR_COLORS = [
    'bg-gray-100', 'bg-purple-100', 'bg-indigo-100', 'bg-rose-100', 'bg-green-100'
  ];

  ngOnInit(): void {
    this.loadDashboard();
    this.loadPartnerOAuthInfo();
  }

  loadPartnerOAuthInfo(): void {
    const partnerId = this.authService.partnerId();
    if (partnerId) {
      this.partnerService.getById(partnerId).subscribe({
        next: (partner) => {
          this.mpUserId.set(partner.mpUserId || null);
          this.mpTokenExpiresAt.set(partner.mpTokenExpiresAt || null);
          
          if (partner.gateway) {
            this.partnerGatewayName.set(typeof partner.gateway === 'object' ? partner.gateway.name : partner.gateway);
          } else {
            this.partnerGatewayName.set('Não Definido');
          }

          if (partner.paymentWorkflowMode === 'DECENTRALIZED_IN_STORE_QR') {
            this.partnerWorkflowModeLabel.set('Código QR Modelo Estático (Mercado Pago)');
          } else if (partner.paymentWorkflowMode === 'CENTRALIZED_WEB_CHECKOUT') {
            this.partnerWorkflowModeLabel.set('Checkout Centralizado no SaaS');
          } else {
            this.partnerWorkflowModeLabel.set(partner.paymentWorkflowMode || 'Não Definido');
          }
        },
        error: (err) => console.error('Error loading partner OAuth info:', err)
      });
    }
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

  /** Classe de cor para a resposta da API (20x = Verde, 40x = Vermelho, 50x = Laranja) */
  responseCodeClass(): string {
    const code = this.apiResponseCode();
    if (!code) return '';
    if (code >= 200 && code < 300) return 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20 text-green-600 dark:text-green-400';
    if (code >= 500) return 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20 text-amber-600 dark:text-amber-400';
    return 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400';
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.dashboardService.getStats(this.selectedDays()).subscribe({
      next: (data: DashboardDetail) => {
        this.balance.set(data.availableBalance);
        this.todaySales.set(data.totalTransacted || { gross: 0, fee: 0, net: 0 });
        this.averageTicket.set(data.averageTicket || { gross: 0, fee: 0, net: 0 });

        this.prevBalance.set(data.previousAvailableBalance ?? 0);
        this.prevTodaySales.set(data.previousTotalTransacted || { gross: 0, fee: 0, net: 0 });
        this.prevAverageTicket.set(data.previousAverageTicket || { gross: 0, fee: 0, net: 0 });

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

  requestPayout(): void {
    this.apiResponseMessage.set(null); // Limpa resposta anterior
    this.apiResponseCode.set(null);
    this.showWithdrawModal.set(true);
  }

  closeWithdrawModal(): void {
    this.showWithdrawModal.set(false);
  }

  confirmWithdraw(): void {
    this.loading.set(true);
    this.apiResponseMessage.set(null);
    this.apiResponseCode.set(null);
    this.paymentService.payout({ partnerId: this.authService.partnerId() }).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.apiResponseCode.set(200);

        // Prioriza o campo statusMessage que vem do PayoutResponse do backend
        const msg = typeof res === 'string' ? res : (res?.statusMessage || res?.message || 'Transferência realizada com sucesso!');
        this.apiResponseMessage.set(msg);

        // Sucesso real: aguarda os 10 segundos
        setTimeout(() => {
          this.showWithdrawModal.set(false);
          this.loadDashboard();
        }, 10000);
      },
      error: (err) => {
        this.loading.set(false);

        // O backend agora retorna 400/500, então caímos aqui naturalmente
        const status = err?.status || 400;
        this.apiResponseCode.set(status);

        console.error('Erro ao realizar saque:', err);

        // Tenta extrair a mensagem do corpo do erro (PayoutResponse ou erro genérico)
        const errorData = err?.error;
        const msg = errorData?.statusMessage || errorData?.message || errorData || err?.message || 'Erro inesperado na API do Mercado Pago';

        this.apiResponseMessage.set(`ERRO: ${msg}`);
      }
    });
  }

  connectMercadoPago(): void {
    const partnerId = this.authService.partnerId();
    if (partnerId) {
      this.isConnectingMP.set(true);
      // Pequeno delay para garantir que o indicador renderize antes do redirect
      setTimeout(() => {
        window.location.href = `${environment.apiUrl}/partners/oauth/connect/${partnerId}`;
      }, 150);
    }
  }

  openDisconnectModal(): void {
    this.disconnectLogin.set('');
    this.disconnectPassword.set('');
    this.disconnectError.set(null);
    this.showDisconnectModal.set(true);
  }

  closeDisconnectModal(): void {
    if (!this.isDisconnectingMP()) {
      this.showDisconnectModal.set(false);
      this.disconnectError.set(null);
    }
  }

  confirmDisconnect(): void {
    const login = this.disconnectLogin().trim();
    const pwd = this.disconnectPassword();
    const partnerId = this.authService.partnerId();

    if (!login || !pwd) {
      this.disconnectError.set('Por favor, informe seu usuário e senha.');
      return;
    }

    if (!partnerId) {
      this.disconnectError.set('Identificador do parceiro não encontrado na sessão.');
      return;
    }

    this.isDisconnectingMP.set(true);
    this.disconnectError.set(null);

    // 1. Valida as credenciais da plataforma via /auth/login
    this.http.post<any>(`${environment.apiUrl}/auth/login`, { login, password: pwd }).subscribe({
      next: (authRes) => {
        // Validação adicional de segurança: se não for ADMIN, valida se o usuário autenticado pertence a este parceiro
        if (authRes.role !== 'ADMIN' && authRes.partnerId && Number(authRes.partnerId) !== Number(partnerId)) {
          this.isDisconnectingMP.set(false);
          this.disconnectError.set('Credenciais não autorizadas para este parceiro.');
          return;
        }

        // 2. Executa a desvinculação da conta MP no backend
        this.http.post<any>(`${environment.apiUrl}/mercadopago/reset/partner/${partnerId}`, {}).subscribe({
          next: () => {
            this.isDisconnectingMP.set(false);
            this.mpUserId.set(null);
            this.mpTokenExpiresAt.set(null);
            this.showDisconnectModal.set(false);
            this.loadPartnerOAuthInfo();
          },
          error: (resetErr) => {
            console.error('Erro ao desvincular conta Mercado Pago:', resetErr);
            this.isDisconnectingMP.set(false);
            this.disconnectError.set('Erro ao desvincular no servidor. Tente novamente.');
          }
        });
      },
      error: (loginErr) => {
        console.error('Erro de autenticação para desvinculação:', loginErr);
        this.isDisconnectingMP.set(false);
        this.disconnectError.set('Credenciais inválidas. Verifique seu login e senha.');
      }
    });
  }
}
