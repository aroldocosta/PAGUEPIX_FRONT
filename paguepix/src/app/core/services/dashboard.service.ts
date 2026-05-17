import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DailySales {
    date: string;
    amount: number;
}

export interface RecentTransaction {
    id: string;
    partner: string;
    status: string;
    date: string;
    amount: number;
}

export interface FinancialValue {
    gross: number;
    fee: number;
    net: number;
}

export interface DashboardSummary {
    availableBalance: number;
    totalTransacted: FinancialValue;
    completedPayouts: number;
    averageTicket: FinancialValue;
    previousAvailableBalance: number;
    previousTotalTransacted: FinancialValue;
    previousCompletedPayouts: number;
    previousAverageTicket: FinancialValue;
}

export interface DashboardDetail extends DashboardSummary {
    salesOverview: DailySales[];
    recentTransactions: RecentTransaction[];
}

export interface DashboardData extends DashboardDetail {}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private http = inject(HttpClient);

    getStats(days: number = 7): Observable<DashboardDetail> {
        return this.http.get<DashboardDetail>(`${environment.apiUrl}/dashboard?days=${days}`);
    }

    getSummary(days: number = 7): Observable<DashboardSummary> {
        return this.http.get<DashboardSummary>(`${environment.apiUrl}/dashboard/summary?days=${days}`);
    }
}
