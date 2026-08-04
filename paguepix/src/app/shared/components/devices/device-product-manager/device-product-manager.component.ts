import { Component, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductSummaryResponse, ProductDetailResponse } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DeleteModalComponent } from '../../delete-modal/delete-modal.component';

import { DeviceService, DeviceProductQrResponse } from '../../../../core/services/device.service';

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
    deviceService = inject(DeviceService);
    authService = inject(AuthService);
    deliveryMethods = signal<string[]>([]);
    deviceId = input<string>('');
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
    showCreateModal = signal<boolean>(false);
    showEditModal = signal<boolean>(false);
    showDeleteModal = signal<boolean>(false);
    
    editingProduct = signal<ProductDetailResponse | null>(null);
    productToDelete = signal<ProductDetailResponse | null>(null);
    creatingProduct = signal<boolean>(false);

    // Form fields for creation
    createName = signal('');
    createPrice = signal(0);
    createPriceDisplay = signal('');
    createDuration = signal(10);
    createDurationUnit = signal<ProductDetailResponse['durationUnit']>('MINUTES');
    createFreq = signal<number>(100);
    createSubtitle = signal('');
    createDescription = signal('');
    createDeliveryMethod = signal('MQTT_TIME');

    // Form fields for editing
    editName = signal('');
    editPrice = signal(0);
    editPriceDisplay = signal('');
    editDuration = signal(0);
    editDurationUnit = signal<ProductDetailResponse['durationUnit']>('MINUTES');
    editFreq = signal<number>(100);
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

    onOpenCreateModal() {
        this.createName.set('');
        this.createPrice.set(0);
        this.createPriceDisplay.set('');
        this.createDuration.set(10);
        this.createDurationUnit.set('MINUTES');
        this.createSubtitle.set('');
        this.createDescription.set('');
        this.createDeliveryMethod.set('MQTT_TIME');
        this.showCreateModal.set(true);
        this.showAddModal.set(false);
    }

    onCloseCreateModal() {
        this.showCreateModal.set(false);
    }

    onCreatePriceInput(event: Event) {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/\D/g, '');
        const numericValue = value ? parseInt(value, 10) / 100 : 0;
        this.createPrice.set(numericValue);
        this.createPriceDisplay.set(this.formatPrice(numericValue));
    }

    onConfirmCreate() {
        if (!this.createName() || this.createPrice() <= 0) {
            alert('Por favor, preencha o nome e o preço do produto.');
            return;
        }

        const partnerId = this.authService.partnerId() || (this.partners().length > 0 ? this.partners()[0].id : null);
        if (!partnerId) {
            alert('Não foi possível identificar o parceiro associado.');
            return;
        }

        this.creatingProduct.set(true);
        const request: any = {
            name: this.createName(),
            price: this.createPrice(),
            duration: this.createDuration(),
            durationUnit: this.createDurationUnit(),
            subtitle: this.createSubtitle(),
            description: this.createDescription(),
            deliveryMethod: this.createDeliveryMethod(),
            active: true,
            partnerId: partnerId
        };

        if (this.createDeliveryMethod() === 'MQTT_PULSE') {
            request.qtd = Number(this.createDuration()) || 0;
            request.freq = Number(this.createFreq()) || 100;
        }

        this.productService.create(request as any).subscribe({
            next: (created) => {
                this.creatingProduct.set(false);
                this.showCreateModal.set(false);
                if (created && created.id) {
                    this.add.emit(String(created.id));
                }
            },
            error: (err) => {
                console.error('Error creating product', err);
                this.creatingProduct.set(false);
                alert('Erro ao criar o produto. Tente novamente.');
            }
        });
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
        this.editFreq.set((product as any).freq || 100);
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
            const updatedProduct: any = {
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

            if (this.editDeliveryMethod() === 'MQTT_PULSE') {
                updatedProduct.qtd = Number(this.editDuration()) || 0;
                updatedProduct.freq = Number(this.editFreq()) || 100;
            }

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



    // QR Code Modal State
    showQrModal = signal<boolean>(false);
    loadingQr = signal<boolean>(false);
    selectedProductQr = signal<DeviceProductQrResponse | null>(null);
    copiedState = signal<boolean>(false);

    onOpenQrModal(product: ProductDetailResponse) {
        const dId = this.deviceId();
        if (!dId) return;

        this.loadingQr.set(true);
        this.selectedProductQr.set(null);
        this.copiedState.set(false);
        this.showQrModal.set(true);

        this.deviceService.getDeviceQrCodes(dId).subscribe({
            next: (qrs) => {
                const found = qrs.find(q => String(q.productId) === String(product.id));
                if (found) {
                    this.selectedProductQr.set(found);
                } else {
                    this.selectedProductQr.set({
                        deviceId: String(dId),
                        productId: String(product.id),
                        productName: product.name,
                        price: product.price,
                        durationInSeconds: product.duration,
                        qrCode: '',
                        externalPosId: ''
                    });
                }
                this.loadingQr.set(false);
            },
            error: (err) => {
                console.error('Error fetching device QR codes', err);
                this.loadingQr.set(false);
            }
        });
    }

    onCloseQrModal() {
        this.showQrModal.set(false);
        this.selectedProductQr.set(null);
        this.copiedState.set(false);
    }

    copyPixCode(code: string) {
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            this.copiedState.set(true);
            setTimeout(() => this.copiedState.set(false), 2500);
        });
    }

    getQrCodeImageUrl(code: string): string {
        if (!code) return '';
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(code)}`;
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

