import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ScriptService } from '../../../../core/services/script.service';
import { ManagementLayoutComponent } from '../../../../shared/components/management-layout/management-layout.component';

@Component({
  selector: 'app-script-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ManagementLayoutComponent],
  templateUrl: './edit.html',
  styleUrl: './edit.scss'
})
export class ScriptEdit implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private scriptService = inject(ScriptService);

  id = signal<string | number | null>(null);
  name = signal('');
  code = signal('');
  type = signal('');
  description = signal('');

  loading = signal(false);
  hasData = signal(true);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id.set(idParam);
      this.loadScript(idParam);
    }
  }

  loadScript(id: string | number) {
    this.loading.set(true);
    this.scriptService.findById(id).subscribe({
      next: (script) => {
        this.name.set(script.name || '');
        this.code.set(script.code || '');
        this.type.set(script.type || '');
        this.description.set(script.description || '');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading script', err);
        this.loading.set(false);
      }
    });
  }

  onSave() {
    // Backend model might need ID appended to body, or not.
    // We'll mimic save/update paradigm
    const scriptData: any = {
      name: this.name(),
      code: this.code(),
      type: this.type(),
      description: this.description(),
    };

    if (this.id()) {
      scriptData.id = this.id();
    }

    this.loading.set(true);
    const saveObservable = this.id()
      ? this.scriptService.update(scriptData)
      : this.scriptService.save(scriptData);

    saveObservable.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/scripts']);
      },
      error: (err) => {
        console.error('Error saving script', err);
        this.loading.set(false);
        alert('Erro ao salvar script.');
      }
    });
  }
}
