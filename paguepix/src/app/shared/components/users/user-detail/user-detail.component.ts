import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDetailResponse } from '../../../../core/models/user.model';

@Component({
    selector: 'app-user-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './user-detail.component.html',
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
export class UserDetailComponent {
    @Input({ required: true }) user!: UserDetailResponse;
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}
