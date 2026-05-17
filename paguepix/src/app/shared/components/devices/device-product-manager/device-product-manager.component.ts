import { Component, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductSummaryResponse, ProductDetailResponse } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DeleteModalComponent } from '../../delete-modal/delete-modal.component';

@Component({
    selector: 'app-device-product-manager',
    standalone: true,
    imports: [CommonModule, FormsModule, DeleteModalComponent],
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
export class DeviceProductManagerComponent implements OnInit {
    productService = inject(ProductService);
    authService = inject(AuthService);
    deliveryMethods = signal<string[]>([]);
    availableProducts = input.required<ProductSummaryResponse[]>();
    deviceProducts = input.required<ProductDetailResponse[]>();
    partners = input<any[]>([]);
    loading = input<boolean>(false);
    viewOnly = input<boolean>(false);

    filteredProducts = computed(() => {
        const linkedIds = new Set(this.deviceProducts().map(p => p.id));
        return this.availableProducts().filter(p => p.active && !linkedIds.has(p.id));
    });

    add = output<string>();
    remove = output<string>();
    edit = output<ProductDetailResponse>();


    selectedProductId = signal<string>('');
    showList = signal<boolean>(true); // Default to true now as we mostly want the list visible

    // Modal states
    showAddModal = signal<boolean>(false);
    showEditModal = signal<boolean>(false);
    showDeleteModal = signal<boolean>(false);
    
    editingProduct = signal<ProductDetailResponse | null>(null);
    productToDelete = signal<ProductDetailResponse | null>(null);

    // Form fields for editing
    editName = signal('');
    editPrice = signal(0);
    editPriceDisplay = signal('');
    editDuration = signal(0);

    editDurationUnit = signal<ProductDetailResponse['durationUnit']>('MINUTES');
    editSubtitle = signal('');
    editDescription = signal('');
    editDeliveryMethod = signal('MQTT_TIME');
    editActive = signal(true);
    editPartnerId = signal('');


    ngOnInit() {
        this.loadDeliveryMethods();
    }

    loadDeliveryMethods() {
        this.productService.getDeliveryMethods().subscribe({
            next: (methods) => this.deliveryMethods.set(methods),
            error: (err) => console.error('Error loading delivery methods', err)
        });
    }



    toggleList() {
        this.showList.update(v => !v);
    }

    onOpenAddModal() {
        this.selectedProductId.set('');
        this.showAddModal.set(true);
    }

    onCloseAddModal() {
        this.showAddModal.set(false);
    }

    onConfirmAdd() {
        if (this.selectedProductId()) {
            this.add.emit(this.selectedProductId());
            this.selectedProductId.set('');
            this.showAddModal.set(false);
        }
    }

    onRemove(product: ProductDetailResponse) {
        this.productToDelete.set(product);
        this.showDeleteModal.set(true);
    }

    confirmRemove() {
        const product = this.productToDelete();
        if (product?.id) {
            this.remove.emit(product.id);
        }
        this.closeDeleteModal();
    }

    closeDeleteModal() {
        this.showDeleteModal.set(false);
        this.productToDelete.set(null);
    }

    onEdit(product: ProductDetailResponse) {
        this.editingProduct.set(product);
        this.editName.set(product.name);
        this.editPrice.set(product.price);
        this.editPriceDisplay.set(this.formatPrice(product.price));
        this.editDuration.set(product.duration);

        this.editDurationUnit.set(product.durationUnit);
        this.editSubtitle.set(product.subtitle || '');
        this.editSubtitle.set(product.subtitle || '');
        this.editDescription.set(product.description || '');
        this.editDeliveryMethod.set(product.deliveryMethod || 'MQTT_TIME');
        this.editActive.set(product.active);
        this.editPartnerId.set(String(product.partner?.id || ''));
        this.showEditModal.set(true);
    }


    cancelEdit() {
        this.showEditModal.set(false);
        this.editingProduct.set(null);
    }

    saveEdit() {
        const current = this.editingProduct();
        if (current) {
            const updatedProduct: ProductDetailResponse = {
                ...current,
                name: this.editName(),
                price: this.editPrice(),
                duration: this.editDuration(),
                durationUnit: this.editDurationUnit(),
                subtitle: this.editSubtitle(),
                description: this.editDescription(),
                deliveryMethod: this.editDeliveryMethod(),
                active: this.editActive(),
                partner: this.editPartnerId() ? { id: this.editPartnerId() } as any : undefined
            };

            this.edit.emit(updatedProduct);
            this.showEditModal.set(false);
            this.editingProduct.set(null);
        }
    }

    onPriceInput(event: Event) {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/\D/g, '');
        
        const numericValue = value ? parseInt(value, 10) / 100 : 0;
        this.editPrice.set(numericValue);
        this.editPriceDisplay.set(this.formatPrice(numericValue));
    }

    onPriceBlur() {
        // Normalization is now handled in real-time by onPriceInput
    }

    onSubtitleInput(event: Event) {
        const input = event.target as HTMLInputElement;
        this.editSubtitle.set(input.value);
    }

    onDescriptionInput(event: Event) {
        const input = event.target as HTMLTextAreaElement;
        this.editDescription.set(input.value);
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
