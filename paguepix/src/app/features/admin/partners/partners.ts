import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { PartnerService } from '../../../core/services/partner.service';
import { Partner } from '../../../core/models/partner.model';

import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-partner-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent],
    templateUrl: './partners.html',
    styleUrl: './partners.scss'
})
export class PartnerManagement implements OnInit {
    partners = signal<Partner[]>([]);
    hasData = computed(() => this.partners().length > 0);
    loading = signal(true);

    constructor(private partnerService: PartnerService) { }

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
}
