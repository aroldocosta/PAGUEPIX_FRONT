import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DailySales {
    date: string;
    amount: number;
}

@Component({
    selector: 'app-sales-chart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './sales-chart.html',
})
export class SalesChartComponent {
    @Input() title: string = 'Desempenho de Vendas';
    @Input() selectedDays: number = 7;

    @Input() set salesData(data: DailySales[]) {
        this._rawData.set(data);
    }

    @Output() periodChange = new EventEmitter<number>();

    private _rawData = signal<DailySales[]>([]);

    chartData = computed(() => {
        const data = this._rawData();
        const daysCount = this.selectedDays;
        const dayNames = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SAB.'];
        const now = new Date();
        const fullSalesOverview: { day: string, rawAmount: number, value: number }[] = [];

        const normalize = (val: string) =>
            val.toUpperCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\./g, '')
                .trim();

        // 1. Generate baseline and merge
        const baseline: { day: string, rawAmount: number }[] = [];
        for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);

            // Mode: 30 days -> Day of month (DD), 7 days -> Day of week name (DDD.)
            const dayLabel = daysCount === 30
                ? d.getDate().toString().padStart(2, '0')
                : dayNames[d.getDay()];

            // Busca o dia correspondente nos dados vindos do API
            // No caso de 30 dias, o backend pode mandar a data em formato YYYY-MM-DD ou DD/MM
            // Aqui fazemos uma busca flexível
            const apiDay = data.find(s => {
                const normalizedAPI = normalize(s.date);
                const normalizedLabel = normalize(dayLabel);
                return normalizedAPI === normalizedLabel || normalizedAPI.includes(normalizedLabel);
            });

            baseline.push({
                day: dayLabel,
                rawAmount: apiDay ? apiDay.amount : 0
            });
        }

        // 2. Normalize values (0-85 scale for peak 90% filling)
        const maxAmount = Math.max(...baseline.map(s => s.rawAmount), 1);

        return baseline.map(s => ({
            ...s,
            value: Math.round((s.rawAmount / maxAmount) * 85)
        }));
    });

    maxChartValue = computed(() => {
        const data = this.chartData();
        return Math.max(...data.map(d => d.value), 1);
    });

    maxChartValueLabel = computed(() => {
        const data = this.chartData();
        const maxRaw = Math.max(...data.map(d => d.rawAmount), 1);
        // Round to nearest neat number (e.g. 1000, 5000) for a cleaner Y axis if you'd like, 
        // or just return maxRaw to be exactly the peak.
        // Let's just use maxRaw + some padding (e.g. 10%) so the bars don't hit the very top text.
        return Math.ceil(maxRaw * 1.1);
    });

    onPeriodChange(event: any): void {
        this.periodChange.emit(+event.target.value);
    }
}

