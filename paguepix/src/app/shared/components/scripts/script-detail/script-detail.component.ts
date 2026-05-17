import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScriptDetailResponse } from '../../../../core/models/script.model';

@Component({
    selector: 'app-script-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './script-detail.component.html',
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
export class ScriptDetailComponent {
    @Input({ required: true }) script!: ScriptDetailResponse;
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}
