import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { PartnerService } from '../../../../core/services/partner.service';
import { ManagementLayoutComponent } from '../../../../shared/components/management-layout/management-layout.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ManagementLayoutComponent],
  templateUrl: './edit.html',
  styleUrl: './edit.scss'
})
export class UserEdit implements OnInit {
  // User management properties
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private partnerService = inject(PartnerService);

  id = signal<string | number | null>(null);
  name = signal('');
  login = signal('');
  password = signal('');
  role = signal('PARTNER');
  partnerId = signal<number | null>(null);

  partners = signal<any[]>([]);

  loading = signal(false);
  hasData = signal(true);

  ngOnInit() {
    this.loadPartners();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id.set(idParam);
      this.loadUser(idParam);
    }
  }

  loadPartners() {
    this.partnerService.getAll(0, 100).subscribe({
      next: (response) => {
        this.partners.set(response.content || response);
      },
      error: (err) => console.error('Error loading partners', err)
    });
  }

  loadUser(id: string | number) {
    this.loading.set(true);
    this.userService.getById(id).subscribe({
      next: (user: any) => {
        this.name.set(user.name || '');
        this.login.set(user.login || ''); // Fixed mapping from user.login
        this.role.set(user.role || 'PARTNER');
        // The backend user object might have partner.id or partnerId. Adjust as needed:
        this.partnerId.set(user.partner?.id || user.partnerId || null);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading user', err);
        this.loading.set(false);
      }
    });
  }

  onSave() {
    const userData: any = {
      id: this.id() ? this.id() : undefined,
      name: this.name(),
      login: this.login(), // Send login instead of email to match backend API
      role: this.role(),
    };

    if (this.password()) {
      userData.password = this.password();
    }

    if (this.role() === 'PARTNER') {
      userData.partnerId = this.partnerId();
    }

    this.loading.set(true);
    const saveObservable = this.id()
      ? this.userService.update(userData)
      : this.userService.save(userData);

    saveObservable.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error('Error saving user', err);
        this.loading.set(false);
        alert('Erro ao salvar usuário. Verifique os dados e tente novamente.');
      }
    });
  }
}
