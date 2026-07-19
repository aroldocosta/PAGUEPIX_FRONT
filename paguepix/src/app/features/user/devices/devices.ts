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
    partnerName = computed(() => this.authService.partnerName());

    ngOnInit() {
        this.loadDevices();
    }

    loadDevices() {
        const partnerId = this.authService.partnerId();
        if (!partnerId) {
            this.loading.set(false);
            return;
        }

        this.loading.set(true);
        this.deviceService.findAll(+partnerId, this.currentPage(), 10).subscribe({
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
