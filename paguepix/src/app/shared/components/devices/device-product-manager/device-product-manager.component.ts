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
    edit = output<Product>();


    selectedProductId = signal<string>('');
    showList = signal<boolean>(false);

    // Edit Product Modal state
    showEditModal = signal<boolean>(false);
    editingProduct = signal<Product | null>(null);

    // Form fields for editing
    editName = signal('');
    editPrice = signal(0);
    editPriceDisplay = signal('');
    editDuration = signal(0);

    editDurationUnit = signal<Product['durationUnit']>('MINUTES');
    editSubtitle = signal('');
    editDescription = signal('');



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

    onEdit(product: Product) {
        this.editingProduct.set(product);
        this.editName.set(product.name);
        this.editPrice.set(product.price);
        this.editPriceDisplay.set(product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        this.editDuration.set(product.duration);

        this.editDurationUnit.set(product.durationUnit);
        this.editSubtitle.set(product.subtitle || '');
        this.editDescription.set(product.description || '');
        this.showEditModal.set(true);
    }


    cancelEdit() {
        this.showEditModal.set(false);
        this.editingProduct.set(null);
    }

    saveEdit() {
        const current = this.editingProduct();
        if (current) {
            const updatedProduct: Product = {
                ...current,
                name: this.editName(),
                price: this.editPrice(),
                duration: this.editDuration(),
                durationUnit: this.editDurationUnit(),
                subtitle: this.editSubtitle(),
                description: this.editDescription()
            };

            this.edit.emit(updatedProduct);
            this.showEditModal.set(false);
            this.editingProduct.set(null);
        }
    }

    onPriceInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = input.value.replace(/[^\d,]/g, ''); // Allow only digits and comma
        this.editPriceDisplay.set(value);
        
        const numericValue = parseFloat(value.replace(',', '.'));
        if (!isNaN(numericValue)) {
            this.editPrice.set(numericValue);
        }
    }

    onPriceBlur() {
        // Force 2 decimal places on blur
        const formatted = this.editPrice().toLocaleString('pt-BR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
        this.editPriceDisplay.set(formatted);
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
