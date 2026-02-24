import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { ScriptService } from '../../../core/services/script.service';

@Component({
    selector: 'app-scripts-management',
    standalone: true,
    imports: [CommonModule, ManagementLayoutComponent],
    templateUrl: './scripts.html',
    styleUrl: './scripts.scss'
})
export class ScriptsManagement implements OnInit {
    scripts = signal<any[]>([]);
    hasData = computed(() => this.scripts().length > 0);
    loading = signal(true);

    constructor(private scriptService: ScriptService) { }

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
}
