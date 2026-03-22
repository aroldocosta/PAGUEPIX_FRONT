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
  bankProvider = signal('');
  pixKey = signal('');
  commissionRate = signal<number | null>(null);
  logo = signal<string | null>(null);
  imageError = signal(false);

  selectedFile: File | null = null;

  loading = signal(false);
  hasData = signal(true);

  ngOnInit() {
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
        this.bankProvider.set(partner.bankProvider || '');
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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
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
      bankProvider: this.bankProvider(),
      pixKey: this.pixKey(),
      commissionRate: this.commissionRate()
    };

    this.loading.set(true);
    const saveObservable = this.id()
      ? this.partnerService.update(partnerData)
      : this.partnerService.save(partnerData);

    saveObservable.subscribe({
      next: (savedPartner) => {
        // If a new file was selected, upload it now
        if (this.selectedFile && savedPartner.id) {
          this.partnerService.uploadLogo(savedPartner.id, this.selectedFile).subscribe({
            next: () => {
              this.loading.set(false);
              this.router.navigate(['/admin/partners']);
            },
            error: (err) => {
              console.error('Error uploading logo', err);
              this.loading.set(false);
              this.router.navigate(['/admin/partners']);
            }
          });
        } else {
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
