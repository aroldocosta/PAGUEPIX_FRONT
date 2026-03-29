import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/services/product.service';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './product-detail.component.html',
    styles: [`
        :host { display: block; }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
        }
    `]
})
export class ProductDetailComponent {
    @Input({ required: true }) product!: Product;
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }

    formatUnit(unit: string | undefined): string {
        switch (unit) {
            case 'SECONDS': return 'Segundos';
            case 'MINUTES': return 'Minutos';
            case 'HOURS': return 'Horas';
            default: return unit || '';
        }
    }
}
