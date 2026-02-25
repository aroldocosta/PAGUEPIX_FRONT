# PaguepixFrontend

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
