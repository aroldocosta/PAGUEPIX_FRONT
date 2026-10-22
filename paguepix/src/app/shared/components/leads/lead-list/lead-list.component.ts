import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeadSummary } from '../../../../core/models/lead.model';
import { sortByField, SortDirection } from '../../../../core/utils/sort.utils';

@Component({
    selector: 'app-lead-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './lead-list.component.html',
    styles: [`
        :host { display: block; }
    `]
})
export class LeadListComponent {
    @Input({ required: true }) leads: LeadSummary[] = [];
    @Input() loading: boolean = false;

    sortField: string = 'id';
    sortDirection: SortDirection = 'desc';

    @Output() view = new EventEmitter<string | number>();
    @Output() edit = new EventEmitter<string | number>();
    @Output() remove = new EventEmitter<string | number>();

    get sortedLeads(): LeadSummary[] {
        return sortByField(this.leads, this.sortField, this.sortDirection);
    }

    onSort(field: string) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = (field === 'id') ? 'desc' : 'asc';
        }
    }

    onView(id: string | number) {
        this.view.emit(id);
    }

    onEdit(id: string | number) {
        this.edit.emit(id);
    }

    onDelete(id: string | number) {
        this.remove.emit(id);
    }
}
