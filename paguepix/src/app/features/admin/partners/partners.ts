import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { PartnerDetailComponent } from '../../../shared/components/partners/partner-detail/partner-detail.component';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { PartnerService } from '../../../core/services/partner.service';
import { Partner } from '../../../core/models/partner.model';

import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-partner-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, PartnerDetailComponent, DeleteModalComponent],
    templateUrl: './partners.html',
    styleUrl: './partners.scss'
})
export class PartnerManagement implements OnInit {
    private partnerService = inject(PartnerService);
    partners = signal<Partner[]>([]);
    selectedPartner = signal<Partner | null>(null);
    hasData = computed(() => this.partners().length > 0);
    loading = signal(true);

    // Modal de Exclusão
    showDeleteModal = signal(false);
    isDeleting = signal(false);
    partnerToDelete = signal<Partner | null>(null);

    constructor() { }

    ngOnInit() {
        this.loadPartners();
    }

    loadPartners() {
        this.loading.set(true);
        this.partnerService.getAll().subscribe({
            next: (response) => {
                this.partners.set(response.content || response);
                console.log('PARTNERS LOADED:', this.partners().map(p => ({ original: p.id, type: typeof p.id })));
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading partners', err);
                this.loading.set(false);
            }
        });
    }

    onView(partner: Partner) {
        this.selectedPartner.set(partner);
    }

    onCloseDetail() {
        this.selectedPartner.set(null);
    }

    onDelete(id: string | number) {
        const partner = this.partners().find(p => p.id === id);
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
