#!/usr/bin/env node

/**
 * Simple MCP Server Implementation
 * This is a basic implementation that can run without external dependencies
 * for testing purposes while the main SDK is being installed.
 */

// Simple MCP server without external Node.js imports for now

interface MCPRequest {
  jsonrpc: string;
  id?: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id?: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

class SimpleMCPServer {
  private tools = [
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
            description: "Mathematical expression to evaluate",
          },
        },
        required: ["expression"],
      },
    },
  ];

  private resources = [
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

  handleRequest(request: MCPRequest): MCPResponse {
    const { method, params, id } = request;

    try {
      switch (method) {
        case "initialize":
          return {
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: {},
                resources: {},
              },
              serverInfo: {
                name: "mcp-server-connection",
                version: "1.0.0",
              },
            },
          };

        case "tools/list":
          return {
            jsonrpc: "2.0", 
            id,
            result: { tools: this.tools },
          };

        case "resources/list":
          return {
            jsonrpc: "2.0",
            id, 
            result: { resources: this.resources },
          };

        case "tools/call":
          return this.handleToolCall(params, id);

        case "resources/read":
          return this.handleResourceRead(params, id);

        default:
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
          };
      }
    } catch (error) {
      return {
        jsonrpc: "2.0", 
        id,
        error: {
          code: -32603,
          message: "Internal error",
          data: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private handleToolCall(params: any, id?: string | number): MCPResponse {
    const { name, arguments: args } = params;

    switch (name) {
      case "echo":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text", 
                text: `Echo: ${args?.text || ""}`,
              },
            ],
          },
        };

      case "get_current_time":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: `Current time: ${new Date().toISOString()}`,
              },
            ],
          },
        };

      case "calculate":
        try {
          const expression = args?.expression || "";
          const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "");
          const result = eval(sanitized);
          return {
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: `${expression} = ${result}`,
                },
              ],
            },
          };
        } catch (error) {
          return {
            jsonrpc: "2.0", 
            id,
            error: {
              code: -32603,
              message: "Calculation error",
              data: error instanceof Error ? error.message : String(error),
            },
          };
        }

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Unknown tool: ${name}`,
          },
        };
    }
  }

  private handleResourceRead(params: any, id?: string | number): MCPResponse {
    const { uri } = params;

    switch (uri) {
      case "server://info":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({
                  name: "MCP Server Connection (Simple)",
                  version: "1.0.0",
                  description: "A simple TypeScript MCP server",
                  uptime: process.uptime(),
                }, null, 2),
              },
            ],
          },
        };

      case "server://capabilities":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: "application/json", 
                text: JSON.stringify({
                  tools: this.tools.map(t => ({ name: t.name, description: t.description })),
                  resources: this.resources.map(r => ({ uri: r.uri, name: r.name })),
                }, null, 2),
              },
            ],
          },
        };

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: `Unknown resource: ${uri}`,
          },
        };
    }
  }

  startStdioServer() {
    process.stdin.setEncoding('utf8');
    
    let buffer = '';
    
    process.stdin.on('data', (chunk) => {
      buffer += chunk;
      
      // Process complete JSON-RPC messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const request = JSON.parse(line);
            const response = this.handleRequest(request);
            process.stdout.write(JSON.stringify(response) + '\n');
          } catch (error) {
            const errorResponse: MCPResponse = {
              jsonrpc: "2.0",
              error: {
                code: -32700,
                message: "Parse error",
                data: error instanceof Error ? error.message : String(error),
              },
            };
            process.stdout.write(JSON.stringify(errorResponse) + '\n');
          }
        }
      }
    });

    process.stdin.on('end', () => {
      process.exit(0);
    });

    process.on('SIGINT', () => {
      process.exit(0);
    });

    console.error("Simple MCP Server started (stdio mode)");
  }
}

// Start the server
const server = new SimpleMCPServer();
server.startStdioServer();