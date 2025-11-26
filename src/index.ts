#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "mcp-server-connection",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Define available tools
const tools = [
  {
    name: "echo",
    description: "Echo back the provided text",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text to echo back",
        },
      },
      required: ["text"],
    },
  },
  {
    name: "get_current_time",
    description: "Get the current date and time",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "calculate",
    description: "Perform basic arithmetic calculations",
    inputSchema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "Mathematical expression to evaluate (e.g., '2 + 3 * 4')",
        },
      },
      required: ["expression"],
    },
  },
];

// Define available resources
const resources = [
  {
    uri: "server://info",
    mimeType: "application/json",
    name: "Server Information",
    description: "Information about this MCP server",
  },
  {
    uri: "server://capabilities",
    mimeType: "application/json", 
    name: "Server Capabilities",
    description: "Capabilities supported by this MCP server",
  },
];

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// List available resources  
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "echo": {
        const text = args?.text as string;
        if (!text) {
          throw new McpError(ErrorCode.InvalidParams, "Text parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: `Echo: ${text}`,
            },
          ],
        };
      }

      case "get_current_time": {
        const now = new Date();
        return {
          content: [
            {
              type: "text", 
              text: `Current time: ${now.toISOString()}`,
            },
          ],
        };
      }

      case "calculate": {
        const expression = args?.expression as string;
        if (!expression) {
          throw new McpError(ErrorCode.InvalidParams, "Expression parameter is required");
        }

        try {
          // Safe math evaluation using Function constructor (safer than eval)
          const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
          if (sanitizedExpression !== expression) {
            throw new Error("Invalid characters in expression. Only numbers, +, -, *, /, (, ), and spaces allowed.");
          }
          
          // Additional safety check
          if (sanitizedExpression.includes('__') || sanitizedExpression.includes('constructor')) {
            throw new Error("Invalid expression");
          }
          
          const result = Function(`"use strict"; return (${sanitizedExpression})`)();
          
          if (!Number.isFinite(result)) {
            throw new Error("Result is not a finite number");
          }
          
          return {
            content: [
              {
                type: "text",
                text: `${expression} = ${result}`,
              },
            ],
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Calculation error: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${String(error)}`);
  }
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
  const { uri } = request.params;

  switch (uri) {
    case "server://info": {
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify({
              name: "MCP Server Connection",
              version: "1.0.0",
              description: "A TypeScript implementation of an MCP server",
              author: "MCP Server Connection",
              capabilities: ["tools", "resources"],
              uptime: process.uptime(),
            }, null, 2),
          },
        ],
      };
    }

    case "server://capabilities": {
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify({
              tools: tools.map(tool => ({
                name: tool.name,
                description: tool.description,
              })),
              resources: resources.map(resource => ({
                uri: resource.uri,
                name: resource.name,
                description: resource.description,
              })),
            }, null, 2),
          },
        ],
      };
    }

    default:
      throw new McpError(ErrorCode.InvalidParams, `Unknown resource: ${uri}`);
  }
});

// Error handling
server.onerror = (error: any) => {
  console.error("[MCP Error]", error);
};

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server Connection started successfully");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});