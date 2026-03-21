import { Component, input, output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceFormComponent } from '../device-form/device-form.component';
import { DeviceQrCardComponent } from '../device-qr-card/device-qr-card.component';

@Component({
    selector: 'app-device-detail-layout',
    standalone: true,
    imports: [CommonModule, DeviceFormComponent, DeviceQrCardComponent],
    templateUrl: './device-detail-layout.component.html',
    styles: [`:host { display: block; }`]
})
export class DeviceDetailLayoutComponent {

    // Data inputs
    id = input<string | null>(null);
    mqttId = input.required<string>();
    name = input.required<string>();
    model = input.required<string>();
    partnerId = input<string | null>(null);
    partners = input<any[]>([]);
    qrUrl = input.required<string>();

    // Behaviour inputs
    mode = input<'view' | 'edit'>('view');
    releasing = input<boolean>(false);
    releaseError = input<string | null>(null);

    // Outputs
    save = output<any>();
    releaseManual = output<{ id: string; minutes: number }>();
    cancel = output<void>();

    /** Exposto para que o componente pai possa controlar o modal de liberação */
    @ViewChild(DeviceFormComponent) deviceForm!: DeviceFormComponent;
}
