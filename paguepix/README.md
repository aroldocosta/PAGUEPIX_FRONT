# PaguepixFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

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


