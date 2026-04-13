import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagementLayoutComponent } from '../../../../shared/components/management-layout/management-layout.component';
import { ProductService, Product } from '../../../../core/services/product.service';
import { PartnerService } from '../../../../core/services/partner.service';
import { ProductFormComponent } from '../../../../shared/components/products/product-form/product-form.component';

@Component({
    selector: 'app-product-edit',
    standalone: true,
    imports: [CommonModule, ProductFormComponent, ManagementLayoutComponent],
    templateUrl: './edit.html'
})
export class ProductEdit implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private productService = inject(ProductService);
    private partnerService = inject(PartnerService);

    id = signal<string | undefined>(undefined);
    mode = signal<'view' | 'edit'>('edit');
    loading = signal(false);
    productData = signal<Product | null>(null);
    partners = signal<any[]>([]);

    hasData = computed(() => !!this.productData() || !this.id());

    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id');
        const modeParam = this.route.snapshot.queryParamMap.get('mode');

        if (idParam) {
            this.id.set(idParam);
            this.loadProduct(this.id()!);
        }

        if (modeParam === 'view' || modeParam === 'edit') {
            this.mode.set(modeParam);
        }

        this.loadPartners();
    }

    loadPartners() {
        this.partnerService.getAll(0, 100).subscribe({
            next: (response) => {
                this.partners.set(response.content || []);
            },
            error: (err) => {
                console.error('Error loading partners', err);
            }
        });
    }

    loadProduct(id: string) {
        this.loading.set(true);
        this.productService.findById(id).subscribe({
            next: (product) => {
                this.productData.set(product);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading product', err);
                this.loading.set(false);
                alert('Erro ao carregar dados do produto.');
            }
        });
    }

    onSave(product: Product) {
        this.loading.set(true);
        const request = this.id()
            ? this.productService.update(this.id()!, product)
            : this.productService.save(product);

        request.subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigate(['/admin/products']);
            },
            error: (err) => {
                console.error('Error saving product', err);
                this.loading.set(false);
                alert('Erro ao salvar produto.');
            }
        });
    }

    onCancel() {
        this.router.navigate(['/admin/products']);
    }
}
