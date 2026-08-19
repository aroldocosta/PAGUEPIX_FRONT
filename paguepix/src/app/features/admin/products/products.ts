import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ManagementLayoutComponent } from '../../../shared/components/management-layout/management-layout.component';
import { ProductService, Product, ProductSummaryResponse, ProductDetailResponse } from '../../../core/services/product.service';
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

    products = signal<ProductSummaryResponse[]>([]);
    partners = signal<Partner[]>([]);
    selectedPartnerId = signal<string | number>('all');
    selectedProduct = signal<ProductDetailResponse | null>(null);
    currentPage = signal(0);
    totalPages = signal(1);

    // Modal de Exclusão
    showDeleteModal = signal(false);
    isDeleting = signal(false);
    productToDelete = signal<ProductSummaryResponse | null>(null);

    filteredProducts = computed(() => this.products());

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
        const partnerId = this.selectedPartnerId() === 'all' ? undefined : this.selectedPartnerId().toString();
        this.productService.findAll(partnerId, this.currentPage(), 10).subscribe({
            next: (response) => {
                const content = (response as any).content || response;
                this.products.set(content);
                this.totalPages.set((response as any).totalPages || 1);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading products', err);
                this.loading.set(false);
            }
        });
    }

    onPartnerChange() {
        this.currentPage.set(0);
        this.loadProducts();
    }

    nextPage() {
        if (this.currentPage() < this.totalPages() - 1) {
            this.currentPage.update(p => p + 1);
            this.loadProducts();
        }
    }

    prevPage() {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadProducts();
        }
    }

    onView(product: ProductSummaryResponse) {
        if (!product.id) return;
        this.loading.set(true);
        this.productService.findById(product.id).subscribe({
            next: (detailed) => {
                this.selectedProduct.set(detailed);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading product details', err);
                this.loading.set(false);
                alert('Erro ao carregar detalhes do produto.');
            }
        });
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
