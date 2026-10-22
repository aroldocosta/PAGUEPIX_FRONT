import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductSummaryResponse } from '../../../../core/services/product.service';
import { sortByField, SortDirection } from '../../../../core/utils/sort.utils';

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
    @Input({ required: true }) products: ProductSummaryResponse[] = [];
    @Input() mode: 'admin' | 'user' = 'user';
    @Input() loading: boolean = false;

    sortField: string = 'id';
    sortDirection: SortDirection = 'desc';

    @Output() view = new EventEmitter<ProductSummaryResponse>();
    @Output() edit = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string>();
    @Output() sortChange = new EventEmitter<{ field: string, direction: SortDirection }>();

    get sortedProducts(): ProductSummaryResponse[] {
        return sortByField(this.products, this.sortField, this.sortDirection);
    }

    onSort(field: string) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = (field === 'price' || field === 'id') ? 'desc' : 'asc';
        }
        this.sortChange.emit({ field: this.sortField, direction: this.sortDirection });
    }

    onView(product: ProductSummaryResponse) {
        this.view.emit(product);
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
