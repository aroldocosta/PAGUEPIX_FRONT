import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { ScriptService } from '../../../core/services/script.service';
import { ScriptDetailComponent } from '../../../shared/components/scripts/script-detail/script-detail.component';
import { Script } from '../../../core/models/script.model';

import { RouterModule, Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
    selector: 'app-scripts-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, ScriptDetailComponent],
    templateUrl: './scripts.html',
    styleUrl: './scripts.scss'
})
export class ScriptsManagement implements OnInit {
    private router = inject(Router);
    private scriptService = inject(ScriptService);
    scripts = signal<Script[]>([]);
    selectedScript = signal<Script | null>(null);
    hasData = computed(() => this.scripts().length > 0);
    loading = signal(true);

    constructor() { }

    ngOnInit() {
        this.loadScripts();
    }

    loadScripts() {
        this.loading.set(true);
        this.scriptService.findAll().subscribe({
            next: (response) => {
                this.scripts.set(response.content || response);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading scripts', err);
                this.loading.set(false);
            }
        });
    }

    onView(script: Script) {
        this.selectedScript.set(script);
    }

    onEdit(id: string | number) {
        this.router.navigate(['/admin/scripts/edit', id.toString()]);
    }

    onDelete(id: string | number) {
        if (confirm('Deseja realmente excluir este script?')) {
            this.scriptService.delete(id).subscribe({
                next: () => this.loadScripts(),
                error: (err) => alert('Erro ao excluir script.')
            });
        }
    }
}
