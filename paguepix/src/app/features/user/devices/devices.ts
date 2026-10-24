import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeviceService } from '../../../core/services/device.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { DeviceListComponent } from '../../../shared/components/devices/device-list/device-list.component';
import { Router } from '@angular/router';

import { SortDirection } from '../../../core/utils/sort.utils';

@Component({
    selector: 'app-user-device-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, DeviceListComponent],
    templateUrl: './devices.html',
    styleUrl: './devices.scss'
})
export class UserDeviceManagement implements OnInit {
    private router = inject(Router);
    private deviceService = inject(DeviceService);
    private authService = inject(AuthService);

    devices = signal<any[]>([]);
    hasData = computed(() => this.devices().length > 0);
    loading = signal(true);
    currentPage = signal(0);
    totalPages = signal(1);
    sortField = signal<string>('id');
    sortDirection = signal<SortDirection>('desc');
    partnerName = computed(() => this.authService.partnerName());

    ngOnInit() {
        this.loadDevices();
    }

    onSortChange(sort: { field: string, direction: SortDirection }) {
        this.sortField.set(sort.field);
        this.sortDirection.set(sort.direction);
        this.currentPage.set(0);
        this.loadDevices();
    }

    loadDevices() {
        const partnerId = this.authService.partnerId();
        if (!partnerId) {
            this.loading.set(false);
            return;
        }

        this.loading.set(true);
        const sortParam = `${this.sortField()},${this.sortDirection()}`;
        this.deviceService.findAll(partnerId.toString(), this.currentPage(), 10, sortParam).subscribe({
            next: (response) => {
                this.devices.set(response.content || response);
                this.totalPages.set(response.totalPages || 1);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading devices', err);
                this.loading.set(false);
            }
        });
    }

    nextPage() {
        if (this.currentPage() < this.totalPages() - 1) {
            this.currentPage.update(p => p + 1);
            this.loadDevices();
        }
    }

    prevPage() {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadDevices();
        }
    }

    onView(id: string) {
        this.router.navigate(['/user/devices/view', id]);
    }
}
