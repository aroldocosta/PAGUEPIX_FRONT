import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { LeadListComponent } from '../../../shared/components/leads/lead-list/lead-list.component';
import { LeadDetailComponent } from '../../../shared/components/leads/lead-detail/lead-detail.component';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { LeadService } from '../../../core/services/lead.service';
import { LeadSummary, LeadDetail } from '../../../core/models/lead.model';

@Component({
    selector: 'app-leads-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, LeadListComponent, LeadDetailComponent, DeleteModalComponent],
    templateUrl: './leads.html'
})
export class LeadsManagement implements OnInit {
    private router = inject(Router);
    private leadService = inject(LeadService);

    leads = signal<LeadSummary[]>([]);
    selectedLead = signal<LeadDetail | null>(null);
    hasData = computed(() => this.leads().length > 0);
    loading = signal(true);

    // Modal de Exclusão
    showDeleteModal = signal(false);
    isDeleting = signal(false);
    leadToDelete = signal<LeadSummary | null>(null);

    ngOnInit() {
        this.loadLeads();
    }

    loadLeads() {
        this.loading.set(true);
        this.leadService.findAll().subscribe({
            next: (response: any) => {
                this.leads.set(response.content || response);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading leads', err);
                this.loading.set(false);
            }
        });
    }

    onView(id: string | number) {
        this.loading.set(true);
        this.leadService.findById(id).subscribe({
            next: (lead) => {
                this.selectedLead.set(lead);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading lead details', err);
                this.loading.set(false);
            }
        });
    }

    onEdit(id: string | number) {
        this.router.navigate(['/admin/leads/edit', id.toString()], { queryParams: { mode: 'edit' } });
    }

    onDelete(id: string | number) {
        const lead = this.leads().find(l => l.id.toString() === id.toString());
        if (lead) {
            this.leadToDelete.set(lead);
            this.showDeleteModal.set(true);
        }
    }

    confirmDelete() {
        const lead = this.leadToDelete();
        if (!lead) return;

        this.isDeleting.set(true);
        this.leadService.delete(lead.id).subscribe({
            next: () => {
                this.loadLeads();
                this.closeDeleteModal();
            },
            error: (err) => {
                console.error('Erro ao excluir lead:', err);
                this.isDeleting.set(false);
                alert('Erro ao excluir lead.');
            }
        });
    }

    closeDeleteModal() {
        this.showDeleteModal.set(false);
        this.leadToDelete.set(null);
        this.isDeleting.set(false);
    }
}
