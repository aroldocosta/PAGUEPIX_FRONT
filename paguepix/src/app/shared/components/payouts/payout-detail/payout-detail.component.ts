import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Payout } from '../../../../core/models/payout.model';
import { PayoutService } from '../../../../core/services/payout.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-payout-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payout-detail.component.html',
    styleUrl: './payout-detail.component.scss'
})
export class PayoutDetailComponent {
    private payoutService = inject(PayoutService);
    private sanitizer = inject(DomSanitizer);
    private cdr = inject(ChangeDetectorRef);

    @Input({ required: true }) payout!: Payout;
    @Input() mode: 'admin' | 'user' = 'user';
    @Output() close = new EventEmitter<void>();

    showReceiptPreview = false;
    receiptBlobUrl: SafeResourceUrl | null = null;
    rawReceiptUrl: string | null = null; // Store raw URL for downloading
    isPdf = false;
    loadingReceipt = false;

    onClose() {
        this.close.emit();
    }

    onDownloadReceipt() {
        if (!this.rawReceiptUrl) return;

        const link = document.createElement('a');
        link.href = this.rawReceiptUrl;
        link.download = this.payout.receipt || 'comprovante';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    onViewReceipt() {
        if (!this.payout.receipt) return;

        // If it's an external URL, just open it
        if (this.payout.receipt.startsWith('http')) {
            window.open(this.payout.receipt, '_blank');
            return;
        }

        this.loadingReceipt = true;
        this.payoutService.getReceipt(this.payout.id.toString()).subscribe({
            next: (blob) => {
                const isPdf = blob.type === 'application/pdf';
                const url = URL.createObjectURL(blob);
                const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

                // Use setTimeout to avoid NG0100 error
                setTimeout(() => {
                    this.isPdf = isPdf;
                    this.rawReceiptUrl = url;
                    this.receiptBlobUrl = safeUrl;
                    this.showReceiptPreview = true;
                    this.loadingReceipt = false;
                    this.cdr.detectChanges();
                }, 0);
            },
            error: (err) => {
                console.error('Error fetching receipt', err);
                setTimeout(() => {
                    this.loadingReceipt = false;
                    this.cdr.detectChanges();
                    alert('Não foi possível carregar o comprovante.');
                }, 0);
            }
        });
    }

    closeReceiptPreview() {
        this.showReceiptPreview = false;
        if (this.rawReceiptUrl) {
            URL.revokeObjectURL(this.rawReceiptUrl);
            this.rawReceiptUrl = null;
            this.receiptBlobUrl = null;
        }
    }
}
