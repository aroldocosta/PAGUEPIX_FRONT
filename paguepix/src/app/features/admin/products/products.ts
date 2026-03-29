import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { ProductService, Product } from '../../../core/services/product.service';
import { PartnerService } from '../../../core/services/partner.service';
import { Partner } from '../../../core/models/partner.model';
import { ProductListComponent } from '../../../shared/components/products/product-list/product-list.component';
import { ProductDetailComponent } from '../../../shared/components/products/product-detail/product-detail.component';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-product-management',
    standalone: true,
    imports: [CommonModule, RouterModule, ManagementLayoutComponent, ProductListComponent, FormsModule, ProductDetailComponent, DeleteModalComponent],
    templateUrl: './products.html'
})
export class ProductManagement implements OnInit {
    private router = inject(Router);
    private productService = inject(ProductService);
    private partnerService = inject(PartnerService);

    products = signal<Product[]>([]);
    partners = signal<Partner[]>([]);
    selectedPartnerId = signal<string | number>('all');
    selectedProduct = signal<Product | null>(null);

    // Modal de Exclusão
    showDeleteModal = signal(false);
    isDeleting = signal(false);
    productToDelete = signal<Product | null>(null);

    filteredProducts = computed(() => {
        const pId = this.selectedPartnerId();
        if (pId === 'all') return this.products();
        return this.products().filter(p => p.partner?.id?.toString() === pId.toString());
    });

    hasData = computed(() => this.filteredProducts().length > 0);
    loading = signal(true);

    ngOnInit() {
        this.loadPartners();
        this.loadProducts();
    }

    loadPartners() {
        this.partnerService.getAll(0, 100).subscribe({
            next: (resp) => this.partners.set(resp.content || resp),
            error: (err) => console.error('Error loading partners', err)
        });
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

    onView(product: Product) {
        this.selectedProduct.set(product);
    }

    onEdit(id: string) {
        this.router.navigate(['/admin/products/edit', id], { queryParams: { mode: 'edit' } });
    }

    onDelete(id: string) {
        const product = this.products().find(p => p.id === id);
        if (product) {
            this.productToDelete.set(product);
            this.showDeleteModal.set(true);
        }
    }

    confirmDelete() {
        const product = this.productToDelete();
        if (!product || !product.id) return;

        this.isDeleting.set(true);
        this.productService.delete(product.id).subscribe({
            next: () => {
                this.loadProducts();
                this.closeDeleteModal();
            },
            error: (err) => {
                console.error('Erro ao excluir produto:', err);
                this.isDeleting.set(false);
                alert('Erro ao excluir produto.');
            }
        });
    }

    closeDeleteModal() {
        this.showDeleteModal.set(false);
        this.productToDelete.set(null);
        this.isDeleting.set(false);
    }
}
