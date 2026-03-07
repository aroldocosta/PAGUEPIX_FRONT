import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BoardService } from '../../../../core/services/board.service';
import { BoardRequest } from '../../../../core/models/board.model';
import { ManagementLayoutComponent } from '../../../../shared/components/management-layout/management-layout.component';

@Component({
  selector: 'app-board-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ManagementLayoutComponent],
  templateUrl: './edit.html',
  styleUrl: './edit.scss'
})
export class BoardEdit implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(BoardService);

  id = signal<string | number | null>(null);
  model = signal('');
  description = signal('');

  loading = signal(false);
  hasData = signal(true);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id.set(idParam);
      this.loadBoard(idParam);
    }
  }

  loadBoard(id: string | number) {
    this.loading.set(true);
    this.boardService.findById(id).subscribe({
      next: (board) => {
        this.model.set(board.model || '');
        this.description.set(board.description || '');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading board', err);
        this.loading.set(false);
      }
    });
  }

  onSave() {
    const boardData: BoardRequest = {
      id: this.id() || undefined,
      model: this.model(),
      description: this.description(),
    };

    this.loading.set(true);
    const saveObservable = this.id()
      ? this.boardService.update(boardData)
      : this.boardService.save(boardData);

    saveObservable.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/boards']);
      },
      error: (err) => {
        console.error('Error saving board', err);
        this.loading.set(false);
        alert('Erro ao salvar placa/board.');
      }
    });
  }
}
