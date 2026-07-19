import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { BoardService } from '../../../core/services/board.service';
import { PartnerService } from '../../../core/services/partner.service';
import { BoardDetailComponent } from '../../../shared/components/boards/board-detail/board-detail.component';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { Board } from '../../../core/models/board.model';
import { Partner } from '../../../core/models/partner.model';
import { FormsModule } from '@angular/forms';


import { RouterModule, Router } from '@angular/router';

@Component({
    selector: 'app-board-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, BoardDetailComponent, FormsModule, DeleteModalComponent],
    templateUrl: './boards.html',
    styleUrl: './boards.scss'
})
export class BoardManagement implements OnInit {
    private router = inject(Router);
    private boardService = inject(BoardService);
    private partnerService = inject(PartnerService);
    boards = signal<Board[]>([]);
    partners = signal<Partner[]>([]);
    selectedPartnerId = signal<string | number>('all');
    selectedBoard = signal<Board | null>(null);
    currentPage = signal(0);
    totalPages = signal(1);

    // Modal de Exclusão
    showDeleteModal = signal(false);
    isDeleting = signal(false);
    boardToDelete = signal<Board | null>(null);

    filteredBoards = computed(() => this.boards());

    hasData = computed(() => this.filteredBoards().length > 0);
    loading = signal(true);



    ngOnInit() {
        this.loadPartners();
        this.loadBoards();
    }

    loadPartners() {
        this.partnerService.getAll(0, 100).subscribe({
            next: (resp) => this.partners.set(resp.content || resp),
            error: (err) => console.error('Error loading partners', err)
        });
    }

    loadBoards() {
        this.loading.set(true);
        const partnerId = this.selectedPartnerId() === 'all' ? undefined : +this.selectedPartnerId();
        this.boardService.findAll(partnerId, undefined, this.currentPage(), 10).subscribe({
            next: (response) => {
                this.boards.set(response.content || response);
                this.totalPages.set(response.totalPages || 1);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading boards', err);
                this.loading.set(false);
            }
        });
    }

    onPartnerChange() {
        this.currentPage.set(0);
        this.loadBoards();
    }

    nextPage() {
        if (this.currentPage() < this.totalPages() - 1) {
            this.currentPage.update(p => p + 1);
            this.loadBoards();
        }
    }

    prevPage() {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadBoards();
        }
    }

    onView(board: Board) {
        this.selectedBoard.set(board);
    }

    onEdit(id: string | number) {
        this.router.navigate(['/admin/boards/edit', id.toString()]);
    }

    onDelete(id: string | number) {
        const board = this.boards().find(b => b.id.toString() === id.toString());
        if (board) {
            this.boardToDelete.set(board);
            this.showDeleteModal.set(true);
        }
    }

    confirmDelete() {
        const board = this.boardToDelete();
        if (!board) return;

        this.isDeleting.set(true);
        this.boardService.delete(board.id.toString()).subscribe({
            next: () => {
                this.loadBoards();
                this.closeDeleteModal();
            },
            error: (err) => {
                console.error('Erro ao excluir placa:', err);
                this.isDeleting.set(false);
                alert('Erro ao excluir placa.');
            }
        });
    }

    closeDeleteModal() {
        this.showDeleteModal.set(false);
        this.boardToDelete.set(null);
        this.isDeleting.set(false);
    }
}
