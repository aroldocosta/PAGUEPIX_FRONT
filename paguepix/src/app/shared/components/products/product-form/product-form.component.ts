import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Product } from '../../../../core/services/product.service';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './product-form.component.html',
    styles: [`
        :host { display: block; }
    `]
})
export class ProductFormComponent implements OnInit {
    @Input() id?: string;
    @Input() name = '';
    @Input() duration: number = 0;
    @Input() durationUnit: 'SECONDS' | 'MINUTES' | 'HOURS' = 'MINUTES';
    @Input() price: number = 0;
    @Input() active = true;
    @Input() mode: 'view' | 'edit' = 'view';
    @Input() loading = false;

    @Output() save = new EventEmitter<Product>();
    @Output() cancel = new EventEmitter<void>();

    ngOnInit() {
    }

    onSave() {
        if (this.mode === 'view') return;
        this.save.emit({
            id: this.id,
            name: this.name,
            duration: this.duration,
            durationUnit: this.durationUnit,
            price: this.price,
            active: this.active
        });
    }

    onCancel() {
        this.cancel.emit();
    }

    getFieldClasses(isSelect: boolean = false) {
        const base = "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl transition-all text-gray-900 dark:text-white outline-none";
        const editable = "focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer";
        const readOnly = "opacity-80 cursor-default grayscale-[0.2]";

        return `${base} ${this.mode === 'edit' ? editable : readOnly} ${isSelect ? 'appearance-none' : ''}`;
    }
}
