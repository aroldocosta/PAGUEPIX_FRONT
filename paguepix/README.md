# Paguepix

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4210/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## MCP Server (Model Context Protocol)

This project includes an MCP server that allows AI agents and tools (like Claude Desktop or other MCP clients) to interact with the project source code.

### Capabilities
- `read_file`: Read content of files within `src/app`.
- `write_file`: Write content to files within `src/app`.
- `list_files`: List files in `src/app`.

### Configuration
To configure your MCP client to use this server, add the following to your configuration file (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "paguepix-angular": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/Projects/microLet/REPOSITORY/PAGUEPIX_BACK/frontend/paguepix-front",
      "env": {}
    }
  }
}
```

Make sure to run `npm install` before using the MCP server to ensure all dependencies are installed.

### Linking with Google Stitch

For detailed instructions on how to link this project with Google Stitch (to sync UI designs), please refer to [docs/STITCH_SETUP.md](docs/STITCH_SETUP.md).



## Documentação de Segurança: Sealed Envelope

Foi implementada uma estratégia de **"Sealed Envelope"** (Envelope Selado) para garantir a integridade e segurança na criação de cobranças a partir de páginas públicas.

### O Fluxo de Segurança
1.  **Captura de Identidade**: O sistema extrai o `deviceId` e `partnerId` a partir de um token de 26 caracteres na URL (geralmente via QR Code).
2.  **Montagem da Intenção**: Antes de enviar ao backend, o frontend agrupa os IDs, o tempo selecionado pelo usuário (`duration`) e um `timestamp` de criação.
3.  **Criptografia RSA (Asimétrica)**: Utilizando a **Web Crypto API** nativa, esses dados são encriptados com uma **Chave Pública RSA**.
4.  **Envelope Selado**: O resultado é uma string Base64 opaca que é enviada ao backend. Somente o backend (possuindo a Chave Privada) consegue ler o conteúdo.
5.  **Validação de Expiração**: O backend valida se a requisição é recente (limite de 3 minutos) para evitar ataques de replay.

### Benefícios
- **Impedimento de Fraude**: O usuário não consegue alterar o valor ou o tempo da venda injetando dados no console.
- **Privacidade**: IDs internos do banco de dados não trafegam de forma legível.
- **Segurança de Dispositivo**: Um QR Code de uma máquina não pode ser usado para ativar outra máquina por meio de manipulação de URL.

### Como Verificar
1. Inicie o fluxo de compra na rota `/sales/:token`.
2. Verifique no console do navegador o log `"Encrypted Payload:"`.
3. Certifique-se de que a requisição para o backend contém apenas o campo `payload` encriptado.

> [!IMPORTANT]
> A implementação utiliza **RSA-OAEP** com hash **SHA-256**. A chave pública deve ser configurada no `SalesTimeComponent`.

---

---

## Gestão de Dispositivos e Checklist de Prontidão

Para garantir que o administrador e os instaladores em campo tenham visão clara do estado de cada ponto de venda, a interface de dispositivos incorpora um **Semáforo de Prontidão**:

1. 🔌 **Hardware (IoT)**: Indica se a placa física (`Board`) está associada, online e recebendo telemetria via MQTT, disponibilizando botão de teste de disparo de relé em 1 clique.
2. 🏷️ **Serviços & Produtos**: Valida se há produtos cadastrados e associados ao canal do dispositivo.
3. 💳 **Checkout Centralizado**: Exibe o link e QR Code prontos para impressão e fixação na máquina física.
4. 🟢 **Status Geral**: Diferencia máquinas "Prontas para Vender" de máquinas "Aguardando Instalação Física".

---

## Como Criar um Novo Produto / Página de Vendas (Arquitetura Polimórfica)

O frontend utiliza o padrão **Container vs. Presentational com `*ngComponentOutlet`**. Toda a complexa lógica de pagamento (criptografia RSA, polling em tempo real, Mercado Pago Checkout Pro, sincronização do timer regressivo e persistência em `localStorage`) fica centralizada no `SalesComponent`.

Para adicionar um novo produto (ex: `Cadeira de Massagem`, `Lavadora`, `Inflador de Pneus`, etc.), siga os passos abaixo:

### Passo 1: No Backend (`PAGUEPIX_BACK`)
1. Adicione o novo tipo no enum `DeviceType.java`:
   ```java
   public enum DeviceType {
       PDF,
       EXCEL,
       SHOWER,
       LOCKER,
       VACUUM,
       FIRMWARE,
       CHAFARIZ,
       MASSAGE  // <-- Novo tipo
   }
   ```

---

### Passo 2: No Frontend (`PAGUEPIX_FRONT`)

Você pode escolher entre duas formas de customização:

#### Opção A: Apenas Customização de Tema (Rápida - Sem criar componente visual)
Se o novo produto seguir o layout padrão de cards de tempo/valor:
1. Abra `src/app/features/public/sales/sales-theme.config.ts` e adicione o tema no `PRODUCT_THEMES`:
   ```typescript
   MASSAGE: {
       brandPrefix: 'Smart',
       brandSuffix: 'Massage',
       icon: 'chair', // Nome do ícone Material ou FontAwesome
       iconFamily: 'material',
       productUnitLabel: 'Tempo de Massagem',
       activeMessage: 'Aproveite sua massagem relaxante!',
       endingMessage: 'Seu tempo está acabando!',
       completedMessage: 'Massagem Finalizada',
       thankYouMessage: 'Obrigado por utilizar a SmartMassage.',
       fallbackDescriptions: {
           5: 'Massagem rápida express',
           10: 'Relaxamento padrão',
           15: 'Sessão completa antiestresse'
       }
   }
   ```

#### Opção B: Layout Visual Totalmente Exclusivo (Polimorfismo Completo)
Se o novo produto precisar de uma tela com design, animações e layout HTML/CSS únicos:
1. Crie o componente em `src/app/features/public/sales/layouts/massage-layout.component.ts`:
   ```typescript
   import { Component, Input } from '@angular/core';
   import { CommonModule } from '@angular/common';
   import { SalesLayoutProps } from '../sales-layout.types';

   @Component({
       selector: 'app-massage-layout',
       standalone: true,
       imports: [CommonModule],
       template: `<!-- Seu HTML customizado consumindo [props]="props" -->`
   })
   export class MassageLayoutComponent {
       @Input() props!: SalesLayoutProps;
   }
   ```
2. Registre o novo layout no `src/app/features/public/sales/sales-layout.registry.ts`:
   ```typescript
   export const SALES_LAYOUT_REGISTRY: Record<string, Type<any>> = {
       SHOWER: ShowerLayoutComponent,
       VACUUM: VacuumLayoutComponent,
       MASSAGE: MassageLayoutComponent, // <-- Registro
       DEFAULT: DefaultTimerLayoutComponent
   };
   ```

---

### Passo 3: Registrar Rota Dedicada (Opcional)
Em `src/app/app.routes.ts`, registre a rota pública se desejar uma URL amigável dedicada:
```typescript
{ path: 'massage/:token', component: PublicSalesComponent },
```
*(Nota: A rota genérica `/p/:token` já atende automaticamente qualquer novo tipo de dispositivo cadastrado).*

