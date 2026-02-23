import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DeviceService } from '../../../core/services/device.service';

@Component({
    selector: 'app-device-management',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './devices.html',
    styleUrl: './devices.scss'
})
export class DeviceManagement implements OnInit {
    devices = signal<any[]>([]);
    loading = signal(true);

    constructor(private deviceService: DeviceService) { }

    ngOnInit() {
        this.loadDevices();
    }

    loadDevices() {
        this.loading.set(true);
        this.deviceService.findAll().subscribe({
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
