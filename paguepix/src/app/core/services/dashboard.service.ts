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

export interface DashboardData {
    availableBalance: number;
    totalTransacted: number;
    completedPayouts: number;
    averageTicket: number;
    previousAvailableBalance: number;
    previousTotalTransacted: number;
    previousCompletedPayouts: number;
    previousAverageTicket: number;
    salesOverview: DailySales[];
    recentTransactions: RecentTransaction[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private http = inject(HttpClient);

    getStats(days: number = 7): Observable<DashboardData> {
        return this.http.get<DashboardData>(`${environment.apiUrl}/dashboard?days=${days}`);
    }
}
