import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../../../core/services/product.service';

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
    @Input() subtitle = '';
    @Input() description = '';
    @Input() deliveryMethod = 'MQTT_TIME';
    @Input() freq: number = 100;
    @Input() mode: 'view' | 'edit' = 'view';
    @Input() loading = false;
    @Input() partners: any[] = [];
    @Input() partnerId?: string;

    @Output() save = new EventEmitter<Product>();
    @Output() cancel = new EventEmitter<void>();

    productService = inject(ProductService);
    deliveryMethods: string[] = [];
    priceDisplay = '';

    ngOnInit() {
        this.loadDeliveryMethods();
        this.formatInitialPrice();
    }

    formatInitialPrice() {
        if (this.price !== undefined) {
            this.priceDisplay = this.formatCurrency(this.price);
        }
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    }

    onPriceInput(event: Event) {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/\D/g, '');
        
        const numericValue = value ? parseInt(value, 10) / 100 : 0;
        this.price = numericValue;
        this.priceDisplay = this.formatCurrency(numericValue);
    }

    loadDeliveryMethods() {
        this.productService.getDeliveryMethods().subscribe({
            next: (methods) => this.deliveryMethods = methods,
            error: (err) => console.error('Error loading delivery methods', err)
        });
    }

    onSave() {
        if (this.mode === 'view') return;
        const payload: any = {
            id: this.id,
            name: this.name,
            duration: this.duration,
            durationUnit: this.durationUnit || 'SECONDS',
            price: this.price,
            active: this.active,
            subtitle: this.subtitle,
            description: this.description,
            deliveryMethod: this.deliveryMethod,
            partner: this.partnerId ? { id: this.partnerId.toString() } as any : undefined
        };

        if (this.deliveryMethod === 'MQTT_PULSE') {
            payload.qtd = Number(this.duration) || 0;
            payload.freq = Number(this.freq) || 100;
        }

        this.save.emit(payload);
    }

    onCancel() {
        this.cancel.emit();
    }

    getFieldClasses(isSelect: boolean = false) {
        const base = "w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all text-slate-900 dark:text-white outline-none font-medium text-sm";
        const editable = "focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 cursor-pointer";
        const readOnly = "opacity-80 cursor-default grayscale-[0.2]";

        return `${base} ${this.mode === 'edit' ? editable : readOnly} ${isSelect ? 'appearance-none' : ''}`;
    }
}
