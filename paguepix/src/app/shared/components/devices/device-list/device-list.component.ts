import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-device-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
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

    onView(id: string) {
        this.view.emit(id);
    }

    onEdit(id: string) {
        this.edit.emit(id);
    }

    onDelete(id: string) {
        this.delete.emit(id);
    }
}
