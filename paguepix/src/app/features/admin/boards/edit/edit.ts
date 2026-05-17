import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BoardService } from '../../../../core/services/board.service';
import { ScriptService } from '../../../../core/services/script.service';
import { DeviceService } from '../../../../core/services/device.service';
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
  private scriptService = inject(ScriptService);
  private deviceService = inject(DeviceService);

  id = signal<string | number | null>(null);
  clientId = signal('');
  model = signal('');
  description = signal('');
  scriptId = signal<string | number | null>(null);

  scripts = signal<any[]>([]);
  devices = signal<any[]>([]);

  loading = signal(false);
  hasData = signal(true);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id.set(idParam);
      this.loadBoard(idParam);
    }
    this.loadScripts();
    this.loadDevices();
  }

  loadScripts() {
    this.scriptService.findAll(0, 100).subscribe({
      next: (resp) => this.scripts.set(resp.content),
      error: (err) => console.error('Error loading scripts', err)
    });
  }

  loadDevices() {
    this.deviceService.findAll(undefined, 0, 100).subscribe({
      next: (resp) => this.devices.set(resp.content),
      error: (err) => console.error('Error loading devices', err)
    });
  }

  loadBoard(id: string | number) {
    this.loading.set(true);
    this.boardService.findById(id).subscribe({
      next: (board) => {
        this.clientId.set(board.mqttId || board.clientId || '');
        this.model.set(board.model || '');
        this.description.set(board.description || '');
        this.scriptId.set(board.script?.id || null);
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
      clientId: this.clientId(),
      mqttId: this.clientId(),
      model: this.model(),
      description: this.description(),
      scriptId: this.scriptId()!
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
