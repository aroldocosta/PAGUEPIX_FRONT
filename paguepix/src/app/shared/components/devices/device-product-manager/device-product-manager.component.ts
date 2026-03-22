import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../core/services/product.service';

@Component({
    selector: 'app-device-product-manager',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './device-product-manager.component.html',
    styles: [`
        :host { display: block; }
        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        @media (prefers-color-scheme: dark) {
            .glass-card {
                background: rgba(15, 23, 42, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        }
    `]
})
export class DeviceProductManagerComponent {
    availableProducts = input.required<Product[]>();
    deviceProducts = input.required<Product[]>();
    loading = input<boolean>(false);
    viewOnly = input<boolean>(false);

    filteredProducts = computed(() => {
        const linkedIds = new Set(this.deviceProducts().map(p => p.id));
        return this.availableProducts().filter(p => p.active && !linkedIds.has(p.id));
    });

    add = output<string>();
    remove = output<string>();

    selectedProductId = signal<string>('');
    showList = signal<boolean>(false);

    toggleList() {
        this.showList.update(v => !v);
    }

    onAdd() {
        if (this.selectedProductId()) {
            this.add.emit(this.selectedProductId());
            this.selectedProductId.set('');
        }
    }

    onRemove(productId: string) {
        this.remove.emit(productId);
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
