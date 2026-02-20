import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";
import { glob } from "glob";

// Base directory for file operations (restrict to src/app for safety)
const BASE_DIR = path.resolve(process.cwd(), "src/app");

const server = new Server(
    {
        name: "paguepix-front-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            resources: {},
            tools: {},
        },
    }
);

// Helper to validate paths
function validatePath(requestedPath: string): string {
    const fullPath = path.resolve(BASE_DIR, requestedPath);
    if (!fullPath.startsWith(BASE_DIR)) {
        throw new Error("Access denied: Path is outside src/app");
    }
    return fullPath;
}

// List Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    // List all files in src/app recursively to expose as resources
    // Using simple glob pattern
    // Note: In a real scenario, we might want to be more selective to avoid huge lists

    // We'll skip implementation details for listing resources for now to keep it simple
    // or we can implement a basic one.
    // Let's implement a basic one using 'glob' if available or just list top level?
    // Since 'glob' is not in dependencies, let's use a recursive function or just skip for now unless requested.
    // Wait, I can install 'glob' or use 'fs' recursively.
    // For simplicity, let's just support reading known paths via resources and return an empty list or specific important files.

    return {
        resources: []
    };
});

// Read Resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    const url = new URL(uri);
    if (url.protocol !== "file:") {
        throw new Error("Only file resources are supported");
    }

    // Allow reading via absolute path if it matches our project structure or relative to src/app
    // For simplicity using the path directly if it is within BASE_DIR
    // This is a bit tricky with "file:///" URIs. 
    // Let's assume the URI is file:///src/app/path/to/file

    const relativePath = uri.replace("file:///src/app/", "");
    const fullPath = validatePath(relativePath);

    try {
        const content = await fs.readFile(fullPath, "utf-8");
        return {
            contents: [
                {
                    uri: uri,
                    mimeType: "text/plain",
                    text: content,
                },
            ],
        };
    } catch (error: any) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
});


// List Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "read_file",
                description: "Read the content of a file within src/app",
                inputSchema: zodToJsonSchema(z.object({
                    path: z.string().describe("Relative path to the file from src/app"),
                })),
            },
            {
                name: "write_file",
                description: "Write content to a file within src/app. Creates directories if needed.",
                inputSchema: zodToJsonSchema(z.object({
                    path: z.string().describe("Relative path to the file from src/app"),
                    content: z.string().describe("Content to write to the file"),
                })),
            },
            {
                name: "list_files",
                description: "List files in src/app recursively",
                inputSchema: zodToJsonSchema(z.object({
                    path: z.string().optional().describe("Optional sub-directory path to list from")
                }))
            }
        ],
    };
});

// Call Tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "read_file") {
        const { path: relativePath } = z.object({ path: z.string() }).parse(args);
        const fullPath = validatePath(relativePath);
        try {
            const content = await fs.readFile(fullPath, "utf-8");
            return {
                content: [{ type: "text", text: content }],
            };
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Error reading file: ${err.message}` }],
                isError: true,
            };
        }
    }

    if (name === "write_file") {
        const { path: relativePath, content } = z.object({ path: z.string(), content: z.string() }).parse(args);
        const fullPath = validatePath(relativePath);
        try {
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.writeFile(fullPath, content, "utf-8");
            return {
                content: [{ type: "text", text: `Successfully wrote to ${relativePath}` }],
            };
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Error writing file: ${err.message}` }],
                isError: true,
            };
        }
    }

    if (name === "list_files") {
        const { path: relativePath } = z.object({ path: z.string().optional() }).parse(args);
        const searchDir = relativePath ? validatePath(relativePath) : BASE_DIR;

        try {
            const files = await getFilesRecursively(searchDir);
            // Convert absolute paths back to relative for display
            const relativeFiles = files.map(f => path.relative(BASE_DIR, f));
            return {
                content: [{ type: "text", text: JSON.stringify(relativeFiles, null, 2) }]
            }
        } catch (err: any) {
            return {
                content: [{ type: "text", text: `Error listing files: ${err.message}` }],
                isError: true
            }
        }
    }

    throw new Error(`Unknown tool: ${name}`);
});

async function getFilesRecursively(dir: string): Promise<string[]> {
    let results: string[] = [];
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const file of list) {
        const fullPath = path.resolve(dir, file.name);
        if (file.isDirectory()) {
            results = results.concat(await getFilesRecursively(fullPath));
        } else {
            results.push(fullPath);
        }
    }
    return results;
}

// Helper for Zod schema conversion (simplified)
function zodToJsonSchema(schema: z.ZodType): any {
    // Use a library like zod-to-json-schema in production,
    // but for this simple case, we can verify or just use 'any' if we trust the input structure
    // For the purpose of this snippet, let's use a simplified approach or just rely on the fact
    // that the SDK handles JSON schema.
    // Actually, the SDK expects a JSON Schema object.
    // Let's implement a very basic converter or import 'zod-to-json-schema'.
    // Since I didn't install 'zod-to-json-schema', I will use a placeholder or basic manual definition if possible.
    // Re-checking dependencies... I only installed 'zod'.
    // I will just manually define the schemas for now to avoid extra dependencies.

    // Wait, I can't easily convert zod to json schema without the lib.
    // I will modify the inputSchema definitions to be raw JSON schema objects instead of using Zod there.
    return {};
}

// CORRECTING THE SCHEMA DEFINITIONS
// Re-defining tools with manual JSON schema

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "read_file",
                description: "Read the content of a file within src/app",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: { type: "string", description: "Relative path to the file from src/app" }
                    },
                    required: ["path"]
                },
            },
            {
                name: "write_file",
                description: "Write content to a file within src/app. Creates directories if needed.",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: { type: "string", description: "Relative path to the file from src/app" },
                        content: { type: "string", description: "Content to write to the file" }
                    },
                    required: ["path", "content"]
                },
            },
            {
                name: "list_files",
                description: "List files in src/app recursively",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: { type: "string", description: "Optional sub-directory path to list from" }
                    }
                }
            }
        ],
    };
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
