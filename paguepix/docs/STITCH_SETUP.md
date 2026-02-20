# Integração com Google Stitch (MCP)

Este guia explica como conectar o seu projeto **Google Stitch** ao seu ambiente local e utilizá-lo em conjunto com o servidor MCP deste projeto Angular.

Ao conectar ambos via MCP (Model Context Protocol), seu assistente de IA (Claude Desktop, Gemini CLI, Cursor, etc.) poderá ler os designs gerados no Stitch e escrever o código correspondente diretamente neste projeto local.

## Pré-requisitos

1.  **Conta Google Cloud**: Você precisa de um projeto no Google Cloud.
2.  **Node.js**: Versão 18 ou superior.
3.  **Google Cloud CLI (gcloud)**: Instalado e configurado.

## Passo 1: Habilitar a API do Stitch

No seu terminal, habilite a API do Stitch para o seu projeto Google Cloud:

```bash
gcloud beta services mcp enable stitch.googleapis.com
```

## Passo 2: Execução da Configuração (Já realizada)

Eu executei o comando `init` para configurar o cliente de forma direta ("Direct Connection").

Foi gerado um arquivo `.env` na raiz do projeto `paguepix-front`.

**AÇÃO NECESSÁRIA:**
1.  Obtenha sua API Key do Stitch (https://stitch.withgoogle.com).
2.  Abra o arquivo `.env` e cole sua chave:
    ```env
    STITCH_API_KEY=sua-chave-aqui
    ```

## Passo 3: Configurar seu Cliente MCP

Com a conexão "Direta" via API Key, a configuração para sua ferramenta de IA (ex: Claude Desktop) deve utilizar a URL do servidor Stitch diretamente.

Adicione ao seu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "paguepix-front": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/Projects/microLet/REPOSITORY/PAGUEPIX_BACK/frontend/paguepix-front",
      "env": {}
    },
    "stitch": {
      "serverUrl": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "SUA-API-KEY-AQUI" 
      }
    }
  }
}
```

> **Nota**: Se sua ferramenta não suportar `serverUrl` (SSE) diretamente com headers, você pode precisar usar o modo Proxy (via `npx ... serve`). Mas o modo "Direct" é o padrão moderno.


## Passo 4: Como Utilizar

Após reiniciar seu Cliente MCP (Claude Desktop, etc.), você poderá dar comandos como:

> "Verifique o design 'Tela de Login' no projeto Stitch e implemente o código HTML/CSS correspondente no arquivo `src/app/login/login.component.html` do meu projeto local."

O assistente usará:
1.  A ferramenta do **Stitch** para ler o design.
2.  A ferramenta **`write_file`** do projeto local para salvar o código.
