import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PartnerService } from '../../../../core/services/partner.service';
import { ManagementLayoutComponent } from '../../../../shared/components/management-layout/management-layout.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-partner-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ManagementLayoutComponent],
  templateUrl: './edit.html',
  styleUrl: './edit.scss'
})
export class PartnerEdit implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private partnerService = inject(PartnerService);

  id = signal<string | number | null>(null);
  name = signal('');
  description = signal('');
  gateway = signal('');
  pixKey = signal('');
  commissionRate = signal<number | null>(null);
  logo = signal<string | null>(null);
  imageError = signal(false);
  gateways = signal<any[]>([]);

  selectedFile: File | null = null;

  loading = signal(false);
  hasData = signal(true);

  ngOnInit() {
    this.partnerService.getGateways().subscribe({
      next: (g) => this.gateways.set(g),
      error: (e) => console.error('Error fetching gateways', e)
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id.set(idParam);
      this.loadPartner(idParam);
    }
  }

  loadPartner(id: string | number) {
    this.loading.set(true);
    this.partnerService.getById(id).subscribe({
      next: (partner) => {
        this.name.set(partner.name || '');
        this.description.set(partner.description || '');
        
        let initialGateway = '';
        if (partner.gateway) {
          initialGateway = typeof partner.gateway === 'object' ? partner.gateway.code || partner.gateway.name : partner.gateway;
        }
        this.gateway.set(initialGateway);
        
        this.pixKey.set(partner.pixKey || '');
        this.commissionRate.set(partner.commissionRate || null);
        
        if (partner.logo) {
          this.logo.set(`${environment.apiUrl}/partners/${partner.id}/logo`);
        } else {
          this.logo.set(null);
        }
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading partner', err);
        this.loading.set(false);
      }
    });
  }

  triggerFileInput(input: HTMLInputElement) {
    console.log('Triggering file input click');
    input.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.imageError.set(false); // Reset error state for new preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logo.set(e.target.result); // preview
      };
      reader.readAsDataURL(file);
    }
  }

  onSave() {
    const partnerData = {
      id: this.id() ? this.id() : undefined,
      name: this.name(),
      description: this.description(),
      gateway: this.gateway(),
      pixKey: this.pixKey(),
      commissionRate: this.commissionRate()
    };

    this.loading.set(true);
    const saveObservable = this.id()
      ? this.partnerService.update(partnerData)
      : this.partnerService.save(partnerData);

    saveObservable.subscribe({
      next: (savedPartner) => {
        console.log('Partner saved successfully:', savedPartner);
        
        // Ensure we have an ID to associate with the logo
        const partnerId = savedPartner?.id || this.id();
        
        // If a new file was selected, upload it now
        if (this.selectedFile && partnerId) {
          console.log('Uploading logo for partner:', partnerId);
          this.partnerService.uploadLogo(partnerId, this.selectedFile).subscribe({
            next: (updatedPartner) => {
              console.log('Logo uploaded successfully:', updatedPartner);
              this.loading.set(false);
              this.router.navigate(['/admin/partners']);
            },
            error: (err) => {
              console.error('Error uploading logo:', err);
              this.loading.set(false);
              this.router.navigate(['/admin/partners']);
            }
          });
        } else {
          console.log('No logo to upload or missing partner ID.', { 
            hasFile: !!this.selectedFile, 
            partnerId: partnerId 
          });
          this.loading.set(false);
          this.router.navigate(['/admin/partners']);
        }
      },
      error: (err) => {
        console.error('Error saving partner', err);
        this.loading.set(false);
        alert('Erro ao salvar parceiro.');
      }
    });
  }
}
