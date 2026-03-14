import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-device-details-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './device-details-card.component.html',
    styles: [`
        :host { display: block; }
    `]
})
export class DeviceDetailsCardComponent {
    @Input({ required: true }) id!: string;
    @Input({ required: true }) code!: string;
    @Input() name: string = '';
    @Input({ required: true }) model!: string;
    @Input() loading: boolean = false;
    @Input() mode: 'admin' | 'view' = 'view';

    @Output() release = new EventEmitter<void>();
    @Output() edit = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();

    onRelease() {
        this.release.emit();
    }

    onEdit() {
        this.edit.emit();
    }

    onDelete() {
        this.delete.emit();
    }
}
