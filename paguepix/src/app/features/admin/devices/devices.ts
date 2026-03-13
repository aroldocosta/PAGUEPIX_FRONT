import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { DeviceService } from '../../../core/services/device.service';
import { DeviceListComponent } from '../../../shared/components/devices/device-list/device-list.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-device-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, DeviceListComponent],
    templateUrl: './devices.html',
    styleUrl: './devices.scss'
})
export class DeviceManagement implements OnInit {
    private router = inject(Router);
    devices = signal<any[]>([]);
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
        this.router.navigate(['/admin/devices/edit', id]); // Admin edit is the detail view
    }

    onEdit(id: string) {
        this.router.navigate(['/admin/devices/edit', id]);
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
