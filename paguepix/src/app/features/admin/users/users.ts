import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { UserDetailComponent } from '../../../shared/components/users/user-detail/user-detail.component';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { UserService } from '../../../core/services/user.service';
import { PartnerService } from '../../../core/services/partner.service';
import { UserSummaryResponse, UserDetailResponse } from '../../../core/models/user.model';
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
    users = signal<UserSummaryResponse[]>([]);
    partners = signal<Partner[]>([]);
    selectedPartnerId = signal<string | number>('all');
    selectedUser = signal<UserDetailResponse | null>(null);
    loading = signal(true);
    currentPage = signal(0);
    totalPages = signal(1);

    // Modal de Exclusão
    showDeleteModal = signal(false);
    isDeleting = signal(false);
    userToDelete = signal<UserSummaryResponse | null>(null);

    filteredUsers = computed(() => this.users());

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
        const partnerId = this.selectedPartnerId() === 'all' ? undefined : this.selectedPartnerId().toString();
        this.userService.getAll(partnerId, this.currentPage(), 10).subscribe({
            next: (response) => {
                this.users.set(response.content || response);
                this.totalPages.set(response.totalPages || 1);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading users', err);
                this.loading.set(false);
            }
        });
    }

    onPartnerChange() {
        this.currentPage.set(0);
        this.loadUsers();
    }

    nextPage() {
        if (this.currentPage() < this.totalPages() - 1) {
            this.currentPage.update(p => p + 1);
            this.loadUsers();
        }
    }

    prevPage() {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadUsers();
        }
    }

    onView(user: UserSummaryResponse) {
        this.loading.set(true);
        this.userService.getById(user.id).subscribe({
            next: (detailedUser) => {
                this.selectedUser.set(detailedUser);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading user details', err);
                this.loading.set(false);
                alert('Erro ao carregar detalhes do usuário.');
            }
        });
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
