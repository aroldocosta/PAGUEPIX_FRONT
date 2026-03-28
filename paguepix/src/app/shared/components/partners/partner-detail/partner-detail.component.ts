import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Partner } from '../../../../core/models/partner.model';

@Component({
    selector: 'app-partner-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './partner-detail.component.html',
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
export class PartnerDetailComponent {
    @Input({ required: true }) partner!: Partner;
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}
