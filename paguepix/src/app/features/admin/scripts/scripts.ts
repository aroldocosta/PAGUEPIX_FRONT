import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ScriptService } from '../../../core/services/script.service';

@Component({
    selector: 'app-scripts-management',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './scripts.html',
    styleUrl: './scripts.scss'
})
export class ScriptsManagement implements OnInit {
    scripts = signal<any[]>([]);
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
