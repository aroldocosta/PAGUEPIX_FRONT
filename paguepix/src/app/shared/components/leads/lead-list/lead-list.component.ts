import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Lead } from '../../../../core/models/lead.model';

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
    @Input({ required: true }) leads: Lead[] = [];
    @Input() loading: boolean = false;

    @Output() view = new EventEmitter<number>();
    @Output() edit = new EventEmitter<number>();
    @Output() remove = new EventEmitter<number>();

    onView(id: number) {
        this.view.emit(id);
    }

    onEdit(id: number) {
        this.edit.emit(id);
    }

    onDelete(id: number) {
        this.remove.emit(id);
    }
}
