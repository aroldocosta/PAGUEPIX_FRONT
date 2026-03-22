import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../../core/services/product.service';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './product-list.component.html',
    styles: [`
        :host { display: block; }
    `]
})
export class ProductListComponent {
    @Input({ required: true }) products: Product[] = [];
    @Input() mode: 'admin' | 'user' = 'user';
    @Input() loading: boolean = false;

    @Output() view = new EventEmitter<string>();
    @Output() edit = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string>();

    onView(id: string) {
        this.view.emit(id);
    }

    onEdit(id: string) {
        this.edit.emit(id);
    }

    onDelete(id: string) {
        this.delete.emit(id);
    }

    /** Tradução das unidades de tempo */
    formatUnit(unit: string): string {
        switch (unit) {
            case 'SECONDS': return 'Segundos';
            case 'MINUTES': return 'Minutos';
            case 'HOURS': return 'Horas';
            default: return unit;
        }
    }
}
