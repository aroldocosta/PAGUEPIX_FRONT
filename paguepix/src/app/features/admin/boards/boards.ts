import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { BoardService } from '../../../core/services/board.service';

@Component({
    selector: 'app-board-management',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './boards.html',
    styleUrl: './boards.scss'
})
export class BoardManagement implements OnInit {
    boards = signal<any[]>([]);
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
