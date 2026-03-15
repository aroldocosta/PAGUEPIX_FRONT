import { Component, OnInit, signal, inject, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeviceService } from '../../../../core/services/device.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ManagementLayoutComponent } from '../../../../shared/components/management-layout/management-layout.component';
import { DeviceQrCardComponent } from '../../../../shared/components/devices/device-qr-card/device-qr-card.component';
import { DeviceFormComponent } from '../../../../shared/components/devices/device-form/device-form.component';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-user-device-view',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, DeviceQrCardComponent, DeviceFormComponent],
    templateUrl: './view.html',
    styleUrl: './view.scss'
})
export class UserDeviceView implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private deviceService = inject(DeviceService);
    private authService = inject(AuthService);

    @ViewChild(DeviceFormComponent) deviceForm!: DeviceFormComponent;

    id = signal<string | null>(null);
    mqttId = signal('');
    name = signal('');
    model = signal('');
    partnerId = signal<string | null>(null);
    partners = signal<any[]>([]);
    loading = signal(false);
    hasData = signal(true);
    releasing = signal(false);
    releaseError = signal<string | null>(null);
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
                this.mqttId.set(device.mqttId);
                this.name.set(device.name || '');
                this.model.set(device.model);
                this.partnerId.set(device.partner?.id || null);
                if (device.partner) {
                    this.partners.set([device.partner]);
                }
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

    onReleaseManual(event: { id: string, minutes: number }) {
        this.releasing.set(true);
        this.releaseError.set(null);

        this.deviceService.releaseManual(event.id, event.minutes).subscribe({
            next: () => {
                this.releasing.set(false);
                this.deviceForm.showReleaseModal.set(false);
            },
            error: (err) => {
                console.error('Error releasing device', err);
                this.releasing.set(false);
                this.releaseError.set('Erro ao enviar comando de liberação.');
            }
        });
    }

    onCancel() {
        this.router.navigate(['/user/devices']);
    }
}
