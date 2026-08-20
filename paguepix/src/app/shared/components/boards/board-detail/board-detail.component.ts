import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Board } from '../../../../core/models/board.model';
import { DeviceService } from '../../../../core/services/device.service';

@Component({
    selector: 'app-board-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './board-detail.component.html',
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
export class BoardDetailComponent {
    private deviceService = inject(DeviceService);

    @Input({ required: true }) board!: Board;
    @Output() close = new EventEmitter<void>();
    @Output() unlinked = new EventEmitter<void>();

    unlinking = signal(false);

    onClose() {
        this.close.emit();
    }

    onUnlinkDevice() {
        if (!this.board.device?.id) return;
        const deviceName = this.board.device.name || 'Dispositivo';
        const boardName = this.board.mqttId || this.board.name || 'Placa';

        if (!confirm(`Deseja realmente desvincular a placa "${boardName}" do dispositivo "${deviceName}"?`)) {
            return;
        }

        this.unlinking.set(true);
        this.deviceService.unlinkBoard(this.board.device.id).subscribe({
            next: () => {
                this.unlinking.set(false);
                this.board.device = undefined;
                this.unlinked.emit();
            },
            error: (err) => {
                console.error('Erro ao desvincular dispositivo da placa:', err);
                this.unlinking.set(false);
                alert('Erro ao desvincular placa do dispositivo.');
            }
        });
    }
}
