import { Component, OnInit, signal, inject, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeviceService } from '../../../../core/services/device.service';
import { PartnerService } from '../../../../core/services/partner.service';
import { ProductService, Product } from '../../../../core/services/product.service';
import { BoardService } from '../../../../core/services/board.service';
import { Board } from '../../../../core/models/board.model';
import { ManagementLayoutComponent } from '../../../../shared/components/management-layout/management-layout.component';
import { DeviceDetailLayoutComponent } from '../../../../shared/components/devices/device-detail-layout/device-detail-layout.component';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-device-edit',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ManagementLayoutComponent, DeviceDetailLayoutComponent],
    templateUrl: './edit.html',
    styleUrl: './edit.scss'
})
export class DeviceEdit implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private deviceService = inject(DeviceService);
    private partnerService = inject(PartnerService);
    private productService = inject(ProductService);
    private boardService = inject(BoardService);

    @ViewChild(DeviceDetailLayoutComponent) detailLayout!: DeviceDetailLayoutComponent;

    id = signal<string | null>(null);
    formMode = signal<'view' | 'edit'>('edit');
    name = signal('');
    model = signal('');
    partnerId = signal<string | null>(null);
    partners = signal<any[]>([]);
    boards = signal<Board[]>([]);
    boardId = signal<string | number | null>(null);
    type = signal('');
    deviceTypes = signal<string[]>([]);
    loading = signal(false);
    hasData = signal(true);
    releaseError = signal<string | null>(null);
    releasing = signal(false);

    allProductsRaw = signal<Product[]>([]);
    allProducts = computed(() => {
        const pid = this.partnerId();
        if (!pid) return [];
        return this.allProductsRaw().filter(p => p.partner?.id === pid);
    });

    deviceProducts = signal<Product[]>([]);
    productLoading = signal(false);

    qrUrl = computed(() => {
        const currentId = this.id();
        return currentId ? `${environment.apiUrl}/devices/qr/${currentId}` : '';
    });

    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id');
        const modeParam = this.route.snapshot.queryParamMap.get('mode') as 'view' | 'edit';

        if (modeParam) {
            this.formMode.set(modeParam);
        }

        if (idParam) {
            this.id.set(idParam);
            this.loadDevice(idParam);
        }
        this.loadPartners();
        this.loadProducts();
        this.loadBoards();
        this.loadDeviceTypes();
    }

    loadDeviceTypes() {
        this.deviceService.getDeviceTypes().subscribe({
            next: (types) => this.deviceTypes.set(types),
            error: (err) => console.error('Error loading device types', err)
        });
    }

    loadBoards() {
        this.boardService.findAll(undefined, undefined, 0, 100).subscribe({
            next: (response) => {
                this.boards.set(response.content || response);
            },
            error: (err) => console.error('Error loading boards', err)
        });
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
                console.log('Device loaded:', device);
                this.name.set(device.name || '');
                this.model.set(device.model);
                this.partnerId.set(device.partner?.id || null);
                this.boardId.set(device.board?.id || null);
                this.type.set(device.type || '');
                this.deviceProducts.set(device.productList || []);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading device', err);
                this.loading.set(false);
            }
        });
    }

    loadPartners() {
        this.partnerService.getAll(0, 100).subscribe({
            next: (response) => {
                this.partners.set(response.content || response);
            },
            error: (err) => console.error('Error loading partners', err)
        });
    }

    onSave(deviceData: any) {
        this.loading.set(true);
        const deviceId = this.id();
        
        const request = deviceId 
            ? this.deviceService.update(deviceId, deviceData)
            : this.deviceService.save(deviceData);

        request.subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigate(['/admin/devices']);
            },
            error: (err) => {
                console.error(`Error ${deviceId ? 'updating' : 'creating'} device`, err);
                this.loading.set(false);
                alert(`Erro ao ${deviceId ? 'atualizar' : 'criar'} dispositivo.`);
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

    onCancel() {
        this.router.navigate(['/admin/devices']);
    }

    printQr() {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const qrElement = document.querySelector('ngx-kjua svg');
        if (!qrElement) {
            alert('Erro ao gerar código para impressão.');
            return;
        }

        const qrHtml = qrElement.outerHTML;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Impressão QR Code - ${this.name()}</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                        .container { text-align: center; border: 2px dashed #ccc; padding: 20px; border-radius: 10px; }
                        svg { width: 250px; height: 250px; }
                        h2 { margin-top: 15px; color: #333; }
                        p { color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        ${qrHtml}
                        <h2>${this.name()}</h2>
                        <p>ID: ${this.id()}</p>
                        <p>PaguePix Payments</p>
                    </div>
                    <script>
                        setTimeout(() => { window.print(); window.close(); }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
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

        if (!confirm('Tem certeza que deseja remover este produto do dispositivo?')) return;

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

    onEditProduct(product: Product) {
        if (!product.id) return;

        this.productLoading.set(true);
        this.productService.update(product.id, product).subscribe({
            next: () => {
                this.productLoading.set(false);
                const currentId = this.id();
                if (currentId) {
                    this.loadDevice(currentId);
                }
            },
            error: (err) => {
                console.error('Error updating product', err);
                this.productLoading.set(false);
                alert('Erro ao atualizar produto.');
            }
        });
    }
}
