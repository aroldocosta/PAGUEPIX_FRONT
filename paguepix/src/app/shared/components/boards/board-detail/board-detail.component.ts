import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Board } from '../../../../core/models/board.model';

@Component({
    selector: 'app-board-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './board-detail.component.html',
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
export class BoardDetailComponent {
    @Input({ required: true }) board!: Board;
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}
