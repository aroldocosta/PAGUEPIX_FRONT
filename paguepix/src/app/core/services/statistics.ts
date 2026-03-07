import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PeriodSales {
  periodLabel: string;
  amount: number;
}

export interface StatisticsData {
  availableBalance: number;
  totalTransacted: number;
  completedPayouts: number;
  salesOverview: PeriodSales[];
}

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private http = inject(HttpClient);

  getStatistics(startDate: string, endDate: string, partnerId?: number): Observable<StatisticsData> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    if (partnerId) {
      params = params.set('partnerId', partnerId.toString());
    }

    return this.http.get<StatisticsData>(`${environment.apiUrl}/statistics`, { params });
  }
}
