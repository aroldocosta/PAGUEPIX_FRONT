import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BoardService } from '../../../../core/services/board.service';
import { ScriptService } from '../../../../core/services/script.service';
import { DeviceService } from '../../../../core/services/device.service';
import { Board, BoardRequest } from '../../../../core/models/board.model';
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

  // Manual Release properties
  board = signal<Board | null>(null);
  showReleaseModal = signal(false);
  selectedReleaseMinutes = signal(1);
  selectedReleaseChannel = signal(1);
  releaseOptions = signal<{ label: string, value: number }[]>([]);
  releasing = signal(false);
  releaseError = signal<string | null>(null);
  channels = [1, 2, 3, 4, 5, 6, 7, 8];

  deviceChannel = computed(() => {
    const dev = this.board()?.device as any;
    return dev?.channel || 1;
  });

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
        this.board.set(board);
        this.clientId.set(board.mqttId || board.clientId || '');
        this.model.set(board.model || '');
        this.description.set(board.description || '');
        this.scriptId.set(board.script?.id || null);

        if (board.device) {
          this.loadDeviceProducts(board.device.id.toString());
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading board', err);
        this.loading.set(false);
      }
    });
  }

  loadDeviceProducts(deviceId: string) {
    this.deviceService.findById(deviceId).subscribe({
      next: (device) => {
        const products = device.productList || [];
        this.updateReleaseOptions(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading device products for release', err);
        this.updateReleaseOptions([]);
        this.loading.set(false);
      }
    });
  }

  updateReleaseOptions(products: any[]) {
    if (!products || products.length === 0) {
      this.releaseOptions.set([
        { label: '1 MIN', value: 1 },
        { label: '3 MIN', value: 3 },
        { label: '5 MIN', value: 5 },
        { label: '10 MIN', value: 10 }
      ]);
      return;
    }

    const mapped = products.map(product => {
      let minutes = product.duration;
      if (product.durationUnit === 'SECONDS') {
        minutes = Math.max(1, Math.round(product.duration / 60));
      } else if (product.durationUnit === 'HOURS') {
        minutes = product.duration * 60;
      }

      const unitLabel = product.durationUnit === 'SECONDS' ? 'SEG' :
        product.durationUnit === 'HOURS' ? 'HORAS' : 'MIN';

      return {
        label: `${product.name} (${product.duration} ${unitLabel})`,
        value: minutes
      };
    });

    this.releaseOptions.set(mapped);
  }

  onOpenReleaseModal() {
    this.releaseError.set(null);
    this.selectedReleaseMinutes.set(1);
    this.selectedReleaseChannel.set(this.deviceChannel() || 1);
    this.showReleaseModal.set(true);
  }

  cancelRelease() {
    this.showReleaseModal.set(false);
    this.releaseError.set(null);
  }

  confirmRelease() {
    const boardDevice = this.board()?.device;
    if (!boardDevice) return;
    this.releasing.set(true);
    this.releaseError.set(null);
    this.deviceService.releaseManual(boardDevice.id.toString(), this.selectedReleaseMinutes(), this.selectedReleaseChannel()).subscribe({
      next: () => {
        this.releasing.set(false);
        this.showReleaseModal.set(false);
      },
      error: (err) => {
        console.error('Error in manual release:', err);
        this.releasing.set(false);
        this.releaseError.set(err.error?.message || 'Erro ao enviar comando de liberação.');
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
