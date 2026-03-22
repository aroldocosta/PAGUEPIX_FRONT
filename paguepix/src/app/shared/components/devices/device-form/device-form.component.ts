import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Product } from '../../../../core/services/product.service';

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
    @Input({ required: true }) id!: string;
    @Input() mqttId = '';
    @Input() name = '';
    @Input() model = '';
    @Input() partnerId: string | null = null;
    @Input() partners: any[] = [];
    @Input() mode: 'view' | 'edit' = 'view';
    @Input() loading = false;
    @Input() releaseError: string | null = null;
    @Input() deviceProducts: Product[] = [];

    @Output() save = new EventEmitter<any>();
    @Output() releaseManual = new EventEmitter<{ id: string, minutes: number }>();
    @Output() cancel = new EventEmitter<void>();

    showReleaseModal = signal(false);
    selectedReleaseMinutes = signal(1);

    onSave() {
        if (this.mode === 'view') return;
        this.save.emit({
            mqttId: this.mqttId,
            name: this.name,
            model: this.model,
            partnerId: this.partnerId
        });
    }

    onCancel() {
        this.cancel.emit();
    }

    onOpenReleaseModal() {
        this.releaseError = null;
        this.showReleaseModal.set(true);
    }

    cancelRelease() {
        this.showReleaseModal.set(false);
        this.releaseError = null;
    }

    confirmRelease() {
        this.releaseManual.emit({
            id: this.id,
            minutes: this.selectedReleaseMinutes()
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
