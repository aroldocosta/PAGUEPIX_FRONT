import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeviceService } from '../../../core/services/device.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
    selector: 'app-user-device-management',
    standalone: true,
    imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './devices.html',
    styleUrl: './devices.scss'
})
export class UserDeviceManagement implements OnInit {
    private deviceService = inject(DeviceService);
    private authService = inject(AuthService);

    devices = signal<any[]>([]);
    hasData = computed(() => this.devices().length > 0);
    loading = signal(true);
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
        this.deviceService.findAll(+partnerId).subscribe({
            next: (response) => {
                this.devices.set(response.content || response);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading devices', err);
                this.loading.set(false);
            }
        });
    }
}
