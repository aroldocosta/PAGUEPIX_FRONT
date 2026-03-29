import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { DeviceService } from '../../../core/services/device.service';
import { PartnerService } from '../../../core/services/partner.service';
import { DeviceListComponent } from '../../../shared/components/devices/device-list/device-list.component';
import { DeviceDetailComponent } from '../../../shared/components/devices/device-detail/device-detail.component';
import { Device } from '../../../core/models/device.model';
import { Partner } from '../../../core/models/partner.model';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
//Teste
@Component({
    selector: 'app-device-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, DeviceListComponent, DeviceDetailComponent, FormsModule],
    templateUrl: './devices.html',
    styleUrl: './devices.scss'
})
export class DeviceManagement implements OnInit {
    private router = inject(Router);
    devices = signal<Device[]>([]);
    partners = signal<Partner[]>([]);
    selectedPartnerId = signal<string | number>('all');
    selectedDevice = signal<Device | null>(null);

    filteredDevices = computed(() => {
        const pId = this.selectedPartnerId();
        if (pId === 'all') return this.devices();
        return this.devices().filter(d => d.partner?.id?.toString() === pId.toString());
    });

    hasData = computed(() => this.filteredDevices().length > 0);
    loading = signal(true);

    private deviceService = inject(DeviceService);
    private partnerService = inject(PartnerService);

    ngOnInit() {
        this.loadPartners();
        this.loadDevices();
    }

    loadPartners() {
        this.partnerService.getAll(0, 100).subscribe({
            next: (resp) => this.partners.set(resp.content || resp),
            error: (err) => console.error('Error loading partners', err)
        });
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
