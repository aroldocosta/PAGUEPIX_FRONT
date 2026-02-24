import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { DeviceService } from '../../../core/services/device.service';

@Component({
    selector: 'app-device-management',
    standalone: true,
    imports: [CommonModule, ManagementLayoutComponent],
    templateUrl: './devices.html',
    styleUrl: './devices.scss'
})
export class DeviceManagement implements OnInit {
    devices = signal<any[]>([]);
    hasData = computed(() => this.devices().length > 0);
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
