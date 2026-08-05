import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Product } from '../../../../core/services/product.service';
import { Board } from '../../../../core/models/board.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-device-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './device-form.component.html',
    styles: [`
        :host { display: block; }
    `]
})
export class DeviceFormComponent {
    private authService = inject(AuthService);
    isAdmin = computed(() => this.authService.role() === 'ADMIN');

    @Input({ required: true }) id!: string;
    @Input() name = '';
    @Input() model = '';
    @Input() partnerId: string | null = null;
    @Input() partners: any[] = [];
    @Input() mode: 'view' | 'edit' = 'view';
    @Input() loading = false;
    @Input() releaseError: string | null = null;
    private _deviceProducts: Product[] = [];
    @Input() set deviceProducts(value: Product[]) {
        this._deviceProducts = value || [];
        this.updateReleaseOptions();
    }
    get deviceProducts(): Product[] {
        return this._deviceProducts;
    }
    @Input() boards: Board[] = [];
    @Input() boardId: string | number | null = null;
    @Input() type = '';
    @Input() types: string[] = [];
    @Input() channel = 1;
    @Input() externalStoreId = '';
    @Input() externalPosId = '';

    @Output() save = new EventEmitter<any>();
    @Output() releaseManual = new EventEmitter<{ id: string, minutes?: number, productId?: string }>();
    @Output() cancel = new EventEmitter<void>();

    showReleaseModal = signal(false);
    selectedReleaseMinutes = signal(1);
    selectedProductId = signal<string | null>(null);
    releaseOptions = signal<{ label: string, value: string | number, minutes?: number, productId?: string }[]>([]);

    onSave() {
        if (this.mode === 'view') return;
        this.save.emit({
            name: this.name,
            model: this.model,
            type: this.type,
            partnerId: this.partnerId,
            boardId: this.boardId,
            channel: this.channel,
            externalStoreId: this.externalStoreId,
            externalPosId: this.externalPosId
        });
    }

    onCancel() {
        this.cancel.emit();
    }

    updateReleaseOptions() {
        if (!this.deviceProducts || this.deviceProducts.length === 0) {
            this.releaseOptions.set([
                { label: '1 MIN', value: 1, minutes: 1 },
                { label: '3 MIN', value: 3, minutes: 3 },
                { label: '5 MIN', value: 5, minutes: 5 },
                { label: '10 MIN', value: 10, minutes: 10 }
            ]);
            this.selectedProductId.set(null);
            this.selectedReleaseMinutes.set(1);
            return;
        }

        const mapped = this.deviceProducts.map(product => {
            let minutes = product.duration;
            if (product.durationUnit === 'SECONDS') {
                minutes = Math.max(1, Math.round(product.duration / 60));
            } else if (product.durationUnit === 'HOURS') {
                minutes = product.duration * 60;
            }

            const unitLabel = product.durationUnit === 'SECONDS' ? 'SEG' :
                              product.durationUnit === 'HOURS' ? 'HORAS' : 'MIN';

            const priceLabel = product.price != null ? ` - ${this.formatPrice(product.price)}` : '';

            return {
                label: `${product.name}${priceLabel} (${product.duration} ${unitLabel})`,
                value: String(product.id),
                minutes: minutes,
                productId: String(product.id)
            };
        });

        this.releaseOptions.set(mapped);
        if (mapped.length > 0) {
            this.selectedProductId.set(String(mapped[0].value));
            if (mapped[0].minutes) {
                this.selectedReleaseMinutes.set(mapped[0].minutes);
            }
        }
    }

    onSelectProduct(val: string | number) {
        const strVal = String(val);
        this.selectedProductId.set(strVal);
        const found = this.releaseOptions().find(o => String(o.value) === strVal);
        if (found && found.minutes) {
            this.selectedReleaseMinutes.set(found.minutes);
        }
    }

    onOpenReleaseModal() {
        this.releaseError = null;
        this.updateReleaseOptions();
        this.showReleaseModal.set(true);
    }

    cancelRelease() {
        this.showReleaseModal.set(false);
        this.releaseError = null;
    }

    confirmRelease() {
        this.releaseManual.emit({
            id: this.id,
            minutes: this.selectedReleaseMinutes(),
            productId: this.selectedProductId() ?? undefined
        });
    }

    // Helper to determine field classes
    getFieldClasses(isSelect: boolean = false) {
        const base = "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl transition-all text-gray-900 dark:text-white outline-none";
        const editable = "focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer";
        const readOnly = "opacity-80 cursor-default grayscale-[0.2]";

        return `${base} ${this.mode === 'edit' ? editable : readOnly} ${isSelect ? 'appearance-none' : ''}`;
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    }

    formatUnit(unit: string): string {
        switch (unit) {
            case 'SECONDS': return 'Seg';
            case 'MINUTES': return 'Min';
            case 'HOURS': return 'Hrs';
            default: return unit;
        }
    }
}
