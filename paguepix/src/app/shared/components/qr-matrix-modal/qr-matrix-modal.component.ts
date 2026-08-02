import { Component, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService, DeviceProductQrResponse } from '../../../core/services/device.service';

@Component({
    selector: 'app-qr-matrix-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './qr-matrix-modal.component.html',
    styles: [`
        :host { display: block; }
        
        @media print {
            body * {
                visibility: hidden !important;
            }
            .print-area, .print-area * {
                visibility: visible !important;
            }
            .print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            .no-print {
                display: none !important;
            }
            .a4-page {
                width: 210mm !important;
                height: 295mm !important;
                page-break-after: always !important;
                break-after: page !important;
                box-sizing: border-box !important;
                padding: 10mm !important;
                margin: 0 auto !important;
                background: white !important;
            }
        }
    `]
})
export class QrMatrixModalComponent implements OnInit {
    private deviceService = inject(DeviceService);

    deviceId = input.required<string>();
    partnerName = input<string>('PaguePix');
    deviceName = input<string>('Autoatendimento');

    close = output<void>();

    loading = signal<boolean>(true);
    productQrs = signal<DeviceProductQrResponse[]>([]);

    // Divide em fatias de até 6 produtos por página A4 (2 colunas x 3 linhas)
    pages = computed(() => {
        const list = this.productQrs();
        const chunkSize = 6;
        const result: DeviceProductQrResponse[][] = [];
        for (let i = 0; i < list.length; i += chunkSize) {
            result.push(list.slice(i, i + chunkSize));
        }
        return result;
    });

    ngOnInit() {
        this.loadQrCodes();
    }

    loadQrCodes() {
        const id = this.deviceId();
        if (!id) return;

        this.loading.set(true);
        this.deviceService.getDeviceQrCodes(id).subscribe({
            next: (data: DeviceProductQrResponse[]) => {
                this.productQrs.set(data || []);
                this.loading.set(false);
            },
            error: (err: any) => {
                console.error('Erro ao carregar QR codes para impressão da matriz', err);
                this.loading.set(false);
            }
        });
    }

    onClose() {
        this.close.emit();
    }

    print() {
        window.print();
    }

    getQrCodeImageUrl(code: string): string {
        if (!code) return '';
        return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(code)}`;
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    }
}
