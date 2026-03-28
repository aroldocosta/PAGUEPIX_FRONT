import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { DeviceService } from '../../../core/services/device.service';
import { DeviceListComponent } from '../../../shared/components/devices/device-list/device-list.component';
import { DeviceDetailComponent } from '../../../shared/components/devices/device-detail/device-detail.component';
import { Device } from '../../../core/models/device.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-device-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, DeviceListComponent, DeviceDetailComponent],
    templateUrl: './devices.html',
    styleUrl: './devices.scss'
})
export class DeviceManagement implements OnInit {
    private router = inject(Router);
    devices = signal<Device[]>([]);
    selectedDevice = signal<Device | null>(null);
    hasData = computed(() => this.devices().length > 0);
    loading = signal(true);

    private deviceService = inject(DeviceService);

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

    onView(id: string) {
        const device = this.devices().find(d => d.id.toString() === id);
        if (device) {
            this.selectedDevice.set(device);
        }
    }

    onCloseDetail() {
        this.selectedDevice.set(null);
    }

    onEdit(id: string) {
        this.router.navigate(['/admin/devices/edit', id], { queryParams: { mode: 'edit' } });
    }

    onDelete(id: string) {
        if (confirm('Deseja realmente excluir este dispositivo?')) {
            this.deviceService.delete(id).subscribe({
                next: () => this.loadDevices(),
                error: (err) => alert('Erro ao excluir dispositivo.')
            });
        }
    }
}
