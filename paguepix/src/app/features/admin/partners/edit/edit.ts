import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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
export class PartnerEdit implements OnInit, OnDestroy {
  private nameInput$ = new Subject<string>();
  private nameSub?: Subscription;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private partnerService = inject(PartnerService);

  id = signal<string | number | null>(null);
  name = signal('');
  partnerCode = signal('');
  isPartnerCodeManual = signal(false);
  description = signal('');
  gateway = signal('');
  pixKey = signal('');
  bankCode = signal('');
  bankBranch = signal('');
  bankAccount = signal('');
  bankAccountDigit = signal('');
  bankAccountType = signal('CHECKING');
  documentNumber = signal('');
  payoutMethod = signal('AUTOMATIC_TED');
  commissionRate = signal<number | null>(null);
  paymentWorkflowMode = signal('CENTRALIZED_WEB_CHECKOUT');
  mpUserId = signal<string | null>(null);
  mpTokenExpiresAt = signal<string | null>(null);
  logo = signal<string | null>(null);
  imageError = signal(false);
  gateways = signal<any[]>([]);

  selectedFile: File | null = null;

  loading = signal(false);
  isConnectingMP = signal(false);
  hasData = signal(true);

  ngOnInit() {
    this.nameSub = this.nameInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(newName => {
        if (!this.id() && !this.isPartnerCodeManual() && newName && newName.trim()) {
          return this.partnerService.suggestCode(newName.trim(), this.id() || undefined);
        }
        return [];
      })
    ).subscribe({
      next: (resp) => {
        if (resp && resp.code && !this.isPartnerCodeManual()) {
          this.partnerCode.set(resp.code);
        }
      },
      error: (err) => console.error('Error suggesting partner code', err)
    });

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
        this.partnerCode.set(partner.partnerCode || '');
        this.isPartnerCodeManual.set(true);
        this.description.set(partner.description || '');
        
        let initialGateway = '';
        if (partner.gateway) {
          initialGateway = typeof partner.gateway === 'object' ? partner.gateway.code || partner.gateway.name : partner.gateway;
        }
        this.gateway.set(initialGateway);
        
        this.pixKey.set(partner.pixKey || '');
        this.bankCode.set(partner.bankCode || '');
        this.bankBranch.set(partner.bankBranch || '');
        this.bankAccount.set(partner.bankAccount || '');
        this.bankAccountDigit.set(partner.bankAccountDigit || '');
        this.bankAccountType.set(partner.bankAccountType || 'CHECKING');
        this.documentNumber.set(partner.documentNumber || '');
        this.payoutMethod.set(partner.payoutMethod || 'AUTOMATIC_TED');
        this.commissionRate.set(partner.commissionRate || null);
        this.paymentWorkflowMode.set(partner.paymentWorkflowMode || 'CENTRALIZED_WEB_CHECKOUT');
        this.mpUserId.set(partner.mpUserId || null);
        this.mpTokenExpiresAt.set(partner.mpTokenExpiresAt || null);
        
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

  ngOnDestroy() {
    this.nameSub?.unsubscribe();
  }

  onNameInput(newName: string) {
    this.name.set(newName);
    if (!this.id() && !this.isPartnerCodeManual()) {
      if (!newName || !newName.trim()) {
        this.partnerCode.set("");
        return;
      }
      // Instant preliminary local preview
      const clean = newName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      if (clean.length > 0) {
        let slug = clean;
        if (slug.length > 8) {
          slug = slug.substring(0, 8);
        } else if (slug.length < 8) {
          slug = slug + "1".padStart(8 - slug.length, "0");
        }
        this.partnerCode.set(slug);
      } else {
        this.partnerCode.set("");
      }

      // Check collision in real-time with backend
      this.nameInput$.next(newName);
    }
  }

  onPartnerCodeInput(newCode: string) {
    const upper = (newCode || '').toUpperCase();
    if (!upper.trim()) {
      this.isPartnerCodeManual.set(false);
      this.partnerCode.set('');
      if (this.name()) {
        this.onNameInput(this.name());
      }
    } else {
      this.isPartnerCodeManual.set(true);
      this.partnerCode.set(upper);
    }
  }

  onSave() {
    if (this.paymentWorkflowMode() === 'DECENTRALIZED_IN_STORE_QR' && this.gateway() !== 'MRCPAGO') {
      alert("O modelo de Código QR Estático (Descentralizado) está disponível exclusivamente para a integração Mercado Pago.");
      return;
    }
    const partnerData = {
      id: this.id() ? this.id() : undefined,
      name: this.name(),
      partnerCode: this.partnerCode() ? this.partnerCode().trim().toUpperCase() : undefined,
      description: this.description(),
      gateway: this.gateway(),
      pixKey: this.pixKey(),
      bankCode: this.bankCode(),
      bankBranch: this.bankBranch(),
      bankAccount: this.bankAccount(),
      bankAccountDigit: this.bankAccountDigit(),
      bankAccountType: this.bankAccountType(),
      documentNumber: this.documentNumber(),
      payoutMethod: this.payoutMethod(),
      commissionRate: this.commissionRate(),
      paymentWorkflowMode: this.paymentWorkflowMode()
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

  connectMercadoPago() {
    if (this.id()) {
      this.isConnectingMP.set(true);
      // Pequeno delay para garantir que o indicador renderize antes do redirect
      setTimeout(() => {
        window.location.href = `${environment.apiUrl}/partners/oauth/connect/${this.id()}`;
      }, 150);
    }
  }
}
