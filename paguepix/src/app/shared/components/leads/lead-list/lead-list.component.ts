import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeadSummary } from '../../../../core/models/lead.model';

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

    @Output() view = new EventEmitter<string | number>();
    @Output() edit = new EventEmitter<string | number>();
    @Output() remove = new EventEmitter<string | number>();

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
