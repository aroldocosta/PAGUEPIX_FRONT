import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { BoardService } from '../../../core/services/board.service';

@Component({
    selector: 'app-board-management',
    standalone: true,
    imports: [CommonModule, ManagementLayoutComponent],
    templateUrl: './boards.html',
    styleUrl: './boards.scss'
})
export class BoardManagement implements OnInit {
    boards = signal<any[]>([]);
    hasData = computed(() => this.boards().length > 0);
    loading = signal(true);

    constructor(private boardService: BoardService) { }

    ngOnInit() {
        this.loadBoards();
    }

    loadBoards() {
        this.loading.set(true);
        this.boardService.findAll().subscribe({
            next: (response) => {
                this.boards.set(response.content || response);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading boards', err);
                this.loading.set(false);
            }
        });
    }
}
