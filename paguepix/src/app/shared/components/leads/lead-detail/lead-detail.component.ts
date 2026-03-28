import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lead } from '../../../../core/models/lead.model';

@Component({
    selector: 'app-lead-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './lead-detail.component.html',
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
export class LeadDetailComponent {
    @Input({ required: true }) lead!: Lead;
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}
