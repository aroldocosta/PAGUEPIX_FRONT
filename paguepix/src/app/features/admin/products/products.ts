import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { ProductService, Product } from '../../../core/services/product.service';
import { ProductListComponent } from '../../../shared/components/products/product-list/product-list.component';

@Component({
    selector: 'app-product-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, ProductListComponent],
    templateUrl: './products.html'
})
export class ProductManagement implements OnInit {
    private router = inject(Router);
    private productService = inject(ProductService);

    products = signal<Product[]>([]);
    hasData = computed(() => this.products().length > 0);
    loading = signal(true);

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.loading.set(true);
        this.productService.findAll().subscribe({
            next: (response) => {
                // Backend might return a Page object or a direct List
                this.products.set(response.content || response);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading products', err);
                this.loading.set(false);
            }
        });
    }

    onView(id: string) {
        this.router.navigate(['/admin/products/edit', id], { queryParams: { mode: 'view' } });
    }

    onEdit(id: string) {
        this.router.navigate(['/admin/products/edit', id], { queryParams: { mode: 'edit' } });
    }

    onDelete(id: string) {
        if (confirm('Deseja realmente excluir este produto?')) {
            this.productService.delete(id).subscribe({
                next: () => this.loadProducts(),
                error: (err) => alert('Erro ao excluir produto.')
            });
        }
    }
}
