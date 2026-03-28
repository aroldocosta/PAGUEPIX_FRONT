import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Device } from '../../../../core/models/device.model';

@Component({
    selector: 'app-device-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './device-detail.component.html',
    styles: [`
        :host { display: block; }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
        }
    `]
})
export class DeviceDetailComponent {
    @Input({ required: true }) device!: Device;
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}
