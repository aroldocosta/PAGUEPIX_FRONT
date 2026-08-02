import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QrMatrixModalComponent } from '../../qr-matrix-modal/qr-matrix-modal.component';

@Component({
    selector: 'app-device-list',
    standalone: true,
    imports: [CommonModule, RouterModule, QrMatrixModalComponent],
    templateUrl: './device-list.component.html',
    styles: [`
        :host { display: block; }
    `]
})
export class DeviceListComponent {
    @Input({ required: true }) devices: any[] = [];
    @Input() mode: 'admin' | 'user' = 'user';
    @Input() loading: boolean = false;

    @Output() view = new EventEmitter<string>();
    @Output() edit = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string>();

    showQrMatrixModal = signal(false);
    matrixDeviceId = signal('');
    matrixPartnerName = signal('');
    matrixDeviceName = signal('');

    onView(id: string) {
        this.view.emit(id);
    }

    onEdit(id: string) {
        this.edit.emit(id);
    }

    onDelete(id: string) {
        this.delete.emit(id);
    }

    onOpenMatrix(device: any) {
        this.matrixDeviceId.set(String(device.id));
        this.matrixPartnerName.set(device.partner?.name || 'PaguePix');
        this.matrixDeviceName.set(device.name || 'Equipamento');
        this.showQrMatrixModal.set(true);
    }

    onCloseMatrix() {
        this.showQrMatrixModal.set(false);
    }
}
