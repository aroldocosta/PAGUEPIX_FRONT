import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { BoardService } from '../../../core/services/board.service';
import { BoardDetailComponent } from '../../../shared/components/boards/board-detail/board-detail.component';
import { Board } from '../../../core/models/board.model';


import { RouterModule, Router } from '@angular/router';

@Component({
    selector: 'app-board-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, BoardDetailComponent],
    templateUrl: './boards.html',
    styleUrl: './boards.scss'
})
export class BoardManagement implements OnInit {
    private router = inject(Router);
    private boardService = inject(BoardService);
    boards = signal<Board[]>([]);
    selectedBoard = signal<Board | null>(null);
    hasData = computed(() => this.boards().length > 0);
    loading = signal(true);



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

    onView(board: Board) {
        this.selectedBoard.set(board);
    }

    onEdit(id: string | number) {
        this.router.navigate(['/admin/boards/edit', id.toString()]);
    }

    onDelete(id: string | number) {
        if (confirm('Deseja realmente excluir esta placa?')) {
            this.boardService.delete(id).subscribe({
                next: () => this.loadBoards(),
                error: (err) => alert('Erro ao excluir placa.')
            });
        }
    }
}
