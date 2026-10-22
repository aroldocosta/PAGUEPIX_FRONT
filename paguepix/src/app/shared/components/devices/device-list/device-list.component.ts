import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { sortByField, SortDirection } from '../../../../core/utils/sort.utils';

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

    sortField: string = 'id';
    sortDirection: SortDirection = 'desc';

    @Output() view = new EventEmitter<string>();
    @Output() edit = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string>();
    @Output() sortChange = new EventEmitter<{ field: string, direction: SortDirection }>();

    get sortedDevices(): any[] {
        return sortByField(this.devices, this.sortField, this.sortDirection);
    }

    onSort(field: string) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = (field === 'id') ? 'desc' : 'asc';
        }
        this.sortChange.emit({ field: this.sortField, direction: this.sortDirection });
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

