import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeviceService } from '../../../../core/services/device.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ManagementLayoutComponent } from '../../../../shared/components/management-layout/management-layout.component';
import { DeviceQrCardComponent } from '../../../../shared/components/devices/device-qr-card/device-qr-card.component';
import { DeviceDetailsCardComponent } from '../../../../shared/components/devices/device-details-card/device-details-card.component';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-user-device-view',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, DeviceQrCardComponent, DeviceDetailsCardComponent],
    templateUrl: './view.html',
    styleUrl: './view.scss'
})
export class UserDeviceView implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private deviceService = inject(DeviceService);
    private authService = inject(AuthService);

    id = signal<string | null>(null);
    code = signal('');
    name = signal('');
    model = signal('');
    loading = signal(false);
    hasData = signal(true);
    partnerName = computed(() => this.authService.partnerName());

    qrUrl = computed(() => {
        const currentId = this.id();
        return currentId ? `${environment.apiUrl}/devices/qr/${currentId}` : '';
    });

    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.id.set(idParam);
            this.loadDevice(idParam);
        }
    }

    loadDevice(id: string) {
        this.loading.set(true);
        this.deviceService.findById(id).subscribe({
            next: (device) => {
                this.code.set(device.code);
                this.name.set(device.name || '');
                this.model.set(device.model);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading device', err);
                this.loading.set(false);
                alert('Erro ao carregar informações do dispositivo.');
                this.router.navigate(['/user/devices']);
            }
        });
    }

    onRelease() {
        if (!confirm('Deseja enviar um comando de liberação manual para este dispositivo?')) return;

        this.loading.set(true);
        this.deviceService.release(this.id()!).subscribe({
            next: () => {
                this.loading.set(false);
                alert('Comando de liberação enviado com sucesso!');
            },
            error: (err) => {
                console.error('Error releasing device', err);
                this.loading.set(false);
                alert('Erro ao enviar comando de liberação.');
            }
        });
    }
}
