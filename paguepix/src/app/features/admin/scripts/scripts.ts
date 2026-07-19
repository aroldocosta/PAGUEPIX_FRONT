import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { ScriptService } from '../../../core/services/script.service';
import { ScriptDetailComponent } from '../../../shared/components/scripts/script-detail/script-detail.component';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { ScriptSummaryResponse, ScriptDetailResponse } from '../../../core/models/script.model';

import { RouterModule, Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
    selector: 'app-scripts-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, ScriptDetailComponent, DeleteModalComponent],
    templateUrl: './scripts.html',
    styleUrl: './scripts.scss'
})
export class ScriptsManagement implements OnInit {
    private router = inject(Router);
    private scriptService = inject(ScriptService);
    scripts = signal<ScriptSummaryResponse[]>([]);
    selectedScript = signal<ScriptDetailResponse | null>(null);
    currentPage = signal(0);
    totalPages = signal(1);
    hasData = computed(() => this.scripts().length > 0);
    loading = signal(true);

    // Modal de Exclusão
    showDeleteModal = signal(false);
    isDeleting = signal(false);
    scriptToDelete = signal<ScriptSummaryResponse | null>(null);

    constructor() { }

    ngOnInit() {
        this.loadScripts();
    }

    loadScripts() {
        this.loading.set(true);
        this.scriptService.findAll(this.currentPage(), 10).subscribe({
            next: (response) => {
                this.scripts.set(response.content || response);
                this.totalPages.set(response.totalPages || 1);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading scripts', err);
                this.loading.set(false);
            }
        });
    }

    nextPage() {
        if (this.currentPage() < this.totalPages() - 1) {
            this.currentPage.update(p => p + 1);
            this.loadScripts();
        }
    }

    prevPage() {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadScripts();
        }
    }

    onView(script: ScriptSummaryResponse) {
        this.loading.set(true);
        this.scriptService.findById(script.id).subscribe({
            next: (detailedScript) => {
                this.selectedScript.set(detailedScript);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading script details', err);
                this.loading.set(false);
                alert('Erro ao carregar detalhes do script.');
            }
        });
    }

    onEdit(id: string | number) {
        this.router.navigate(['/admin/scripts/edit', id.toString()]);
    }

    onDelete(id: string | number) {
        const script = this.scripts().find(s => s.id.toString() === id.toString());
        if (script) {
            this.scriptToDelete.set(script);
            this.showDeleteModal.set(true);
        }
    }

    confirmDelete() {
        const script = this.scriptToDelete();
        if (!script) return;

        this.isDeleting.set(true);
        this.scriptService.delete(script.id).subscribe({
            next: () => {
                this.loadScripts();
                this.closeDeleteModal();
            },
            error: (err) => {
                console.error('Erro ao excluir script:', err);
                this.isDeleting.set(false);
                alert('Erro ao excluir script.');
            }
        });
    }

    closeDeleteModal() {
        this.showDeleteModal.set(false);
        this.scriptToDelete.set(null);
        this.isDeleting.set(false);
    }
}
