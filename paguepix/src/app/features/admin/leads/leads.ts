import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { LeadListComponent } from '../../../shared/components/leads/lead-list/lead-list.component';
import { LeadDetailComponent } from '../../../shared/components/leads/lead-detail/lead-detail.component';
import { LeadService } from '../../../core/services/lead.service';
import { Lead } from '../../../core/models/lead.model';

@Component({
    selector: 'app-leads-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, LeadListComponent, LeadDetailComponent],
    templateUrl: './leads.html'
})
export class LeadsManagement implements OnInit {
    private router = inject(Router);
    private leadService = inject(LeadService);

    leads = signal<Lead[]>([]);
    selectedLead = signal<Lead | null>(null);
    hasData = computed(() => this.leads().length > 0);
    loading = signal(true);

    ngOnInit() {
        this.loadLeads();
    }

    loadLeads() {
        this.loading.set(true);
        this.leadService.findAll().subscribe({
            next: (response) => {
                this.leads.set(response.content || response);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading leads', err);
                this.loading.set(false);
            }
        });
    }

    onView(id: number) {
        const lead = this.leads().find(l => l.id === id);
        if (lead) {
            this.selectedLead.set(lead);
        }
    }

    onEdit(id: number) {
        this.router.navigate(['/admin/leads/edit', id], { queryParams: { mode: 'edit' } });
    }

    onDelete(id: number) {
        if (confirm('Deseja realmente excluir este lead?')) {
            this.leadService.delete(id).subscribe({
                next: () => this.loadLeads(),
                error: (err) => alert('Erro ao excluir lead.')
            });
        }
    }
}
