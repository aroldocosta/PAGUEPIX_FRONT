import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TopbarComponent } from '../../../../shared/components/topbar/topbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ProductService, Product } from '../../../../core/services/product.service';
import { ProductFormComponent } from '../../../../shared/components/products/product-form/product-form.component';

@Component({
    selector: 'app-product-edit',
    standalone: true,
    imports: [CommonModule, ProductFormComponent, TopbarComponent, SidebarComponent, FooterComponent],
    templateUrl: './edit.html'
})
export class ProductEdit implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private productService = inject(ProductService);

    id = signal<string | undefined>(undefined);
    mode = signal<'view' | 'edit'>('edit');
    loading = signal(false);
    productData = signal<Product | null>(null);

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
