import { Component, OnInit, signal, inject, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeviceService } from '../../../../core/services/device.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product, ProductService } from '../../../../core/services/product.service';

import { ManagementLayoutComponent } from '../../../../shared/components/management-layout/management-layout.component';
import { DeviceDetailLayoutComponent } from '../../../../shared/components/devices/device-detail-layout/device-detail-layout.component';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-user-device-view',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, DeviceDetailLayoutComponent],
    templateUrl: './view.html',
    styleUrl: './view.scss'
})
export class UserDeviceView implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private deviceService = inject(DeviceService);
    private authService = inject(AuthService);
    private productService = inject(ProductService);


    @ViewChild(DeviceDetailLayoutComponent) detailLayout!: DeviceDetailLayoutComponent;

    id = signal<string | null>(null);
    name = signal('');
    model = signal('');
    partnerId = signal<string | null>(null);
    partners = signal<any[]>([]);
    loading = signal(false);
    hasData = signal(true);
    releasing = signal(false);
    releaseError = signal<string | null>(null);
    deviceProducts = signal<Product[]>([]);
    allProductsRaw = signal<Product[]>([]);
    allProducts = computed(() => {
        const pid = this.partnerId();
        if (!pid) return [];
        return this.allProductsRaw().filter(p => p.partner?.id === pid);
    });
    productLoading = signal(false);
    partnerName = computed(() => this.authService.partnerName());

    qrUrl = computed(() => {
        const currentId = this.id();
        return currentId ? `${environment.apiUrl}/devices/qr/${currentId}` : '';
    });

    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.id.set(idParam);
            this.loadDevice(idParam);
            this.loadProducts();
        }
    }

    loadProducts() {
        this.productService.findAll(0, 100).subscribe({
            next: (response) => {
                this.allProductsRaw.set(response.content || response);
            },
            error: (err) => console.error('Error loading products', err)
        });
    }

    loadDevice(id: string) {
        this.loading.set(true);
        this.deviceService.findById(id).subscribe({
            next: (device) => {
                this.name.set(device.name || '');
                this.model.set(device.model);
                this.partnerId.set(device.partner?.id || null);
                if (device.partner) {
                    this.partners.set([device.partner]);
                }
                this.deviceProducts.set(device.productList || []);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading device', err);
                this.loading.set(false);
                alert('Erro ao carregar informações do dispositivo.');
                this.router.navigate(['/user/devices']);
            }
        });
    }

    onReleaseManual(event: { id: string, minutes: number }) {
        this.releasing.set(true);
        this.releaseError.set(null);

        this.deviceService.releaseManual(event.id, event.minutes).subscribe({
            next: () => {
                this.releasing.set(false);
                this.detailLayout.deviceForm.showReleaseModal.set(false);
            },
            error: (err) => {
                console.error('Error releasing device', err);
                this.releasing.set(false);
                this.releaseError.set('Erro ao enviar comando de liberação.');
            }
        });
    }

    onAddProduct(productId: string) {
        const currentId = this.id();
        if (!currentId) return;

        this.productLoading.set(true);
        this.deviceService.addProductToDevice(currentId, productId).subscribe({
            next: () => {
                this.productLoading.set(false);
                this.loadDevice(currentId);
            },
            error: (err) => {
                console.error('Error adding product', err);
                this.productLoading.set(false);
                alert('Erro ao adicionar produto.');
            }
        });
    }

    onRemoveProduct(productId: string) {
        const currentId = this.id();
        if (!currentId) return;

        this.productLoading.set(true);
        this.deviceService.removeProductFromDevice(currentId, productId).subscribe({
            next: () => {
                this.productLoading.set(false);
                this.loadDevice(currentId);
            },
            error: (err) => {
                console.error('Error removing product', err);
                this.productLoading.set(false);
                alert('Erro ao remover produto.');
            }
        });
    }

    onProductUpdated(product: Product) {
        if (!product.id) return;
        
        this.loading.set(true);
        this.productService.update(product.id, product).subscribe({
            next: (updated) => {
                // Update local list
                this.deviceProducts.update(products => 
                    products.map(p => p.id === updated.id ? updated : p)
                );
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error updating product', err);
                this.loading.set(false);
                alert('Erro ao atualizar produto.');
            }
        });
    }


    onCancel() {
        this.router.navigate(['/user/devices']);
    }
}
