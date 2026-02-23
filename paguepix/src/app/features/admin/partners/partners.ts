import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
    selector: 'app-partner-management',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './partners.html',
    styleUrl: './partners.scss'
})
export class PartnerManagement {
    partners = signal([
        { name: 'Loja Central LTDA', cnpj: '12.345.678/0001-90', email: 'contato@lojacentral.com.br', phone: '(11) 98877-6655', status: 'Active', devices: 12 },
        { name: 'Mercado Silva & Filhos', cnpj: '98.765.432/0001-10', email: 'vendas@mercadosilva.com', phone: '(21) 97766-5544', status: 'Active', devices: 5 },
        { name: 'Farmácia Viva Melhor', cnpj: '45.678.901/0001-22', email: 'adm@vivamelhor.com.br', phone: '(31) 96655-4433', status: 'Pending', devices: 2 },
        { name: 'Auto Posto Norte', cnpj: '33.222.111/0001-08', email: 'financeiro@postoonorte.com', phone: '(41) 95544-3322', status: 'Active', devices: 24 },
        { name: 'Padaria Pão Quente', cnpj: '55.444.333/0001-77', email: 'paoquente@gmail.com', phone: '(51) 94433-2211', status: 'Suspended', devices: 1 },
    ]);
}
