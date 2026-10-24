import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SortDirection } from '../../../../core/utils/sort.utils';

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
    @Input() sortField: string = 'id';
    @Input() sortDirection: SortDirection = 'desc';

    @Output() view = new EventEmitter<string>();
    @Output() edit = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string>();
    @Output() sortChange = new EventEmitter<{ field: string, direction: SortDirection }>();

    onSort(field: string) {
        let direction: SortDirection;
        if (this.sortField === field) {
            direction = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            direction = (field === 'id') ? 'desc' : 'asc';
        }
        this.sortChange.emit({ field, direction });
    }

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

