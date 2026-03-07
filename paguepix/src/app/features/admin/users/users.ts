import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { UserService } from '../../../core/services/user.service';

import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent],
    templateUrl: './users.html',
    styleUrl: './users.scss'
})
export class UserManagement implements OnInit {
    users = signal<any[]>([]);
    loading = signal(true);
    hasData = computed(() => this.users().length > 0);

    constructor(private userService: UserService) { }

    ngOnInit() {
        this.loadUsers();
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
}
