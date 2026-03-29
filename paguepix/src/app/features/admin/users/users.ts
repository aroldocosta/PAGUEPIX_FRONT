import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { UserDetailComponent } from '../../../shared/components/users/user-detail/user-detail.component';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { UserService } from '../../../core/services/user.service';
import { PartnerService } from '../../../core/services/partner.service';
import { User } from '../../../core/models/user.model';
import { Partner } from '../../../core/models/partner.model';
import { FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, UserDetailComponent, FormsModule, DeleteModalComponent],
    templateUrl: './users.html',
    styleUrl: './users.scss'
})
export class UserManagement implements OnInit {
    users = signal<User[]>([]);
    partners = signal<Partner[]>([]);
    selectedPartnerId = signal<string | number>('all');
    selectedUser = signal<User | null>(null);
    loading = signal(true);

    // Modal de Exclusão
    showDeleteModal = signal(false);
    isDeleting = signal(false);
    userToDelete = signal<User | null>(null);

    filteredUsers = computed(() => {
        const pId = this.selectedPartnerId();
        if (pId === 'all') return this.users();
        return this.users().filter(u => u.partner?.id?.toString() === pId.toString());
    });

    hasData = computed(() => this.filteredUsers().length > 0);

    private userService = inject(UserService);
    private partnerService = inject(PartnerService);

    ngOnInit() {
        this.loadPartners();
        this.loadUsers();
    }

    loadPartners() {
        this.partnerService.getAll(0, 100).subscribe({
            next: (resp) => this.partners.set(resp.content || resp),
            error: (err) => console.error('Error loading partners', err)
        });
    }

    loadUsers() {
        this.loading.set(true);
        this.userService.getAll().subscribe({
            next: (response) => {
                this.users.set(response.content || response);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading users', err);
                this.loading.set(false);
            }
        });
    }

    onView(user: User) {
        this.selectedUser.set(user);
    }

    onCloseDetail() {
        this.selectedUser.set(null);
    }

    onDelete(id: string | number) {
        const user = this.users().find(u => u.id === id);
        if (user) {
            this.userToDelete.set(user);
            this.showDeleteModal.set(true);
        }
    }

    confirmDelete() {
        const user = this.userToDelete();
        if (!user) return;

        this.isDeleting.set(true);
        this.userService.delete(user.id).subscribe({
            next: () => {
                this.loadUsers();
                this.closeDeleteModal();
            },
            error: (err) => {
                console.error('Erro ao excluir usuário:', err);
                this.isDeleting.set(false);
                alert('Erro ao excluir usuário.');
            }
        });
    }

    closeDeleteModal() {
        this.showDeleteModal.set(false);
        this.userToDelete.set(null);
        this.isDeleting.set(false);
    }
}
