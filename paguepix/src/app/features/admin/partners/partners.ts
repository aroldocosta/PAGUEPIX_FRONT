import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrMatrixModalComponent } from '../../../shared/components/qr-matrix-modal/qr-matrix-modal.component';
import { DeviceService } from '../../../core/services/device.service';
import { PartnerService } from '../../../core/services/partner.service';
import { PartnerSummary, PartnerDetail } from '../../../core/models/partner.model';

import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-partner-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, PartnerDetailComponent, DeleteModalComponent, QrMatrixModalComponent],
    templateUrl: './partners.html',
    styleUrl: './partners.scss'
})
export class PartnerManagement implements OnInit {
    private partnerService = inject(PartnerService);
    private deviceService = inject(DeviceService);
    partners = signal<PartnerSummary[]>([]);
    selectedPartner = signal<PartnerDetail | null>(null);
    hasData = computed(() => this.partners().length > 0);
    loading = signal(true);
    currentPage = signal(0);
    totalPages = signal(1);

    // Modal Matriz QR Codes
    showQrMatrixModal = signal(false);
    matrixDeviceId = signal('');
    matrixPartnerName = signal('');
    matrixDeviceName = signal('');

    // Modal de Exclusão
    showDeleteModal = signal(false);
    isDeleting = signal(false);
    partnerToDelete = signal<PartnerSummary | null>(null);

    constructor() { }

    ngOnInit() {
        this.loadPartners();
    }

    loadPartners() {
        this.loading.set(true);
        this.partnerService.getAll(this.currentPage(), 10).subscribe({
            next: (response) => {
                this.partners.set(response.content || response);
                this.totalPages.set(response.totalPages || 1);
                console.log('PARTNERS LOADED:', this.partners().map(p => ({ original: p.id, type: typeof p.id })));
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading partners', err);
                this.loading.set(false);
            }
        });
    }

    nextPage() {
        if (this.currentPage() < this.totalPages() - 1) {
            this.currentPage.update(p => p + 1);
            this.loadPartners();
        }
    }

    prevPage() {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadPartners();
        }
    }

    onView(partner: PartnerSummary) {
        this.loading.set(true);
        this.partnerService.getById(partner.id).subscribe({
            next: (detailedPartner) => {
                this.selectedPartner.set(detailedPartner);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading partner details', err);
                this.loading.set(false);
            }
        });
    }

    onCloseDetail() {
        this.selectedPartner.set(null);
    }

    onOpenMatrix(partner: PartnerSummary) {
        this.loading.set(true);
        this.deviceService.findAll(Number(partner.id)).subscribe({
            next: (resp) => {
                const list = resp.content || resp;
                if (list && list.length > 0) {
                    const dev = list[0];
                    this.matrixDeviceId.set(String(dev.id));
                    this.matrixPartnerName.set(partner.name);
                    this.matrixDeviceName.set(dev.name || 'Equipamento Principal');
                    this.showQrMatrixModal.set(true);
                } else {
                    alert('Este parceiro não possui equipamentos cadastrados.');
                }
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Erro ao buscar equipamentos do parceiro:', err);
                this.loading.set(false);
            }
        });
    }

    onCloseMatrix() {
        this.showQrMatrixModal.set(false);
    }

    onDelete(id: string | number) {
        const partner = this.partners().find(p => p.id.toString() === id.toString());
        if (partner) {
            this.partnerToDelete.set(partner);
            this.showDeleteModal.set(true);
        }
    }

    confirmDelete() {
        const partner = this.partnerToDelete();
        if (!partner) return;

        this.isDeleting.set(true);
        this.partnerService.delete(partner.id).subscribe({
            next: () => {
                this.loadPartners();
                this.closeDeleteModal();
            },
            error: (err) => {
                console.error('Erro ao excluir parceiro:', err);
                this.isDeleting.set(false);
                alert('Erro ao excluir parceiro.');
            }
        });
    }

    closeDeleteModal() {
        this.showDeleteModal.set(false);
        this.partnerToDelete.set(null);
        this.isDeleting.set(false);
    }
}
