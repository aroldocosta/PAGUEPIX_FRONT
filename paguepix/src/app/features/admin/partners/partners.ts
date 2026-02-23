import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { PartnerService } from '../../../core/services/partner.service';

@Component({
    selector: 'app-partner-management',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './partners.html',
    styleUrl: './partners.scss'
})
export class PartnerManagement implements OnInit {
    partners = signal<any[]>([]);
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
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading partners', err);
                this.loading.set(false);
            }
        });
    }
}
