import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-lead-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './lead-form.component.html',
    styles: [`
        :host { display: block; }
    `]
})
export class LeadFormComponent {
    @Input() id: string | number | null = null;
    @Input() name = '';
    @Input() email = '';
    @Input() barraca = '';
    @Input() whatsapp = '';
    @Input() mode: 'view' | 'edit' = 'view';
    @Input() loading = false;

    @Output() save = new EventEmitter<any>();
    @Output() cancel = new EventEmitter<void>();


    onSave() {
        if (this.mode === 'view') return;
        this.save.emit({
            name: this.name,
            email: this.email,
            barraca: this.barraca,
            whatsapp: this.whatsapp
        });
    }

    onCancel() {
        this.cancel.emit();
    }

    getFieldClasses() {
        const base = "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl transition-all text-gray-900 dark:text-white outline-none";
        const editable = "focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-text";
        const readOnly = "opacity-80 cursor-default grayscale-[0.2]";

        return `${base} ${this.mode === 'edit' ? editable : readOnly}`;
    }

    getSelectClasses() {
         const base = "w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl transition-all text-gray-900 dark:text-white outline-none appearance-none";
         const editable = "focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer";
         const readOnly = "opacity-80 cursor-default grayscale-[0.2]";

         return `${base} ${this.mode === 'edit' ? editable : readOnly}`;
    }
}
