import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LeadService } from '../../../../core/services/lead.service';
import { LeadFormComponent } from '../../../../shared/components/leads/lead-form/lead-form.component';
import { ManagementLayoutComponent } from '../../../../shared/components/management-layout/management-layout.component';

@Component({
    selector: 'app-lead-edit',
    standalone: true,
    imports: [CommonModule, RouterModule, LeadFormComponent, ManagementLayoutComponent],
    templateUrl: './edit.html'
})
export class LeadEdit implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private leadService = inject(LeadService);

    id = signal<number | null>(null);
    formMode = signal<'view' | 'edit'>('edit');
    loading = signal(false);
    lead = signal<any>({});
    hasData = signal(true);

    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id');
        const modeParam = this.route.snapshot.queryParamMap.get('mode') as 'view' | 'edit';

        if (modeParam) {
            this.formMode.set(modeParam);
        }

        if (idParam) {
            this.id.set(Number(idParam));
            this.loadLead(idParam);
        }
    }

    loadLead(id: string) {
        this.loading.set(true);
        this.leadService.findById(id).subscribe({
            next: (lead) => {
                this.lead.set(lead);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading lead', err);
                this.loading.set(false);
            }
        });
    }

    onSave(leadData: any) {
        this.loading.set(true);
        const request = this.id()
            ? this.leadService.update(this.id()!, leadData)
            : this.leadService.save(leadData);

        request.subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigate(['/admin/leads']);
            },
            error: (err) => {
                console.error('Error saving lead', err);
                this.loading.set(false);
                alert('Erro ao salvar lead.');
            }
        });
    }

    onCancel() {
        this.router.navigate(['/admin/leads']);
    }
}
