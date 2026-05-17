import { Component, input, output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceFormComponent } from '../device-form/device-form.component';
import { DeviceQrCardComponent } from '../device-qr-card/device-qr-card.component';
import { DeviceProductManagerComponent } from '../device-product-manager/device-product-manager.component';
import { ProductSummaryResponse, ProductDetailResponse } from '../../../../core/services/product.service';
import { Board } from '../../../../core/models/board.model';

@Component({
    selector: 'app-device-detail-layout',
    standalone: true,
    imports: [CommonModule, DeviceFormComponent, DeviceQrCardComponent, DeviceProductManagerComponent],
    templateUrl: './device-detail-layout.component.html',
    styles: [`:host { display: block; }`]
})
export class DeviceDetailLayoutComponent {

    // Data inputs
    id = input<string | null>(null);
    name = input.required<string>();
    model = input.required<string>();
    partnerId = input<string | null>(null);
    partners = input<any[]>([]);
    qrUrl = input.required<string>();
    boards = input<Board[]>([]);
    boardId = input<string | number | null>(null);
    type = input<string>('');
    types = input<string[]>([]);

    // Behaviour inputs
    mode = input<'view' | 'edit'>('view');
    releasing = input<boolean>(false);
    releaseError = input<string | null>(null);

    // Product related data
    allProducts = input<ProductSummaryResponse[]>([]);
    deviceProducts = input<ProductDetailResponse[]>([]);
    productLoading = input<boolean>(false);

    // Outputs
    save = output<any>();
    releaseManual = output<{ id: string; minutes: number }>();
    cancel = output<void>();

    addProduct = output<string>();
    removeProduct = output<string>();
    editProduct = output<ProductDetailResponse>();


    /** Exposto para que o componente pai possa controlar o modal de liberação */
    @ViewChild(DeviceFormComponent) deviceForm!: DeviceFormComponent;
}
