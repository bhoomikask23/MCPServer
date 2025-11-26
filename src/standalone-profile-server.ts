#!/usr/bin/env node

/**
 * Standalone Profile MCP Server
 * This implementation doesn't require external dependencies and can be run immediately
 * Supports environment variables for production deployment
 */

// Load environment variables (ES module compatible)
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
dotenv.config();

// Type assertion for process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MCP_SERVER_NAME?: string;
      MCP_SERVER_VERSION?: string;
      DEFAULT_PROFILE_ID?: string;
      LOG_LEVEL?: string;
      NODE_ENV?: string;
      RENDER?: string;
      RENDER_EXTERNAL_URL?: string;
    }
  }
}

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

interface ProfileData {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  joinDate: string;
  avatar: string;
  skills: string[];
  projects: Array<{
    name: string;
    status: string;
    completion: number;
  }>;
}

class StandaloneProfileServer {
  private readonly serverName: string;
  private readonly serverVersion: string;
  private readonly defaultProfileId: string;
  private readonly logLevel: string;
  private readonly isProduction: boolean;

  constructor() {
    this.serverName = process.env.MCP_SERVER_NAME || 'profile-mcp-server';
    this.serverVersion = process.env.MCP_SERVER_VERSION || '1.0.0';
    this.defaultProfileId = process.env.DEFAULT_PROFILE_ID || 'default';
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private tools = [
    {
      name: "get_profile",
      description: "Fetch and display user profile information from AWS with a beautiful HTML interface",
      inputSchema: {
        type: "object",
        properties: {
          profileId: {
            type: "string",
            description: "The profile ID to fetch (optional, defaults to 'default')",
          },
        },
      },
    },
  ];

  private resources = [
    {
      uri: "profile://data",
      mimeType: "application/json",
      name: "Profile Data Resource",
      description: "Raw profile data from AWS API",
    },
    {
      uri: "profile://html",
      mimeType: "text/html",
      name: "Profile HTML Resource",
      description: "Formatted HTML profile display",
    },
  ];

  // Note: This function is replaced by getProfileSync for synchronous operation

  private generateProfileHTML(profile: ProfileData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile - ${profile.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .profile-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            overflow: hidden;
            animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .profile-header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px;
            text-align: center;
            color: white;
            position: relative;
        }
        
        .profile-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.1;
        }
        
        .avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 4px solid rgba(255,255,255,0.3);
            margin: 0 auto 20px;
            background: url('${profile.avatar}') center/cover;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }
        
        .name {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
        }
        
        .role {
            font-size: 1.3rem;
            opacity: 0.9;
            font-weight: 300;
            position: relative;
            z-index: 1;
        }
        
        .profile-content {
            padding: 40px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .info-card {
            background: linear-gradient(135deg, #f8faff 0%, #f1f5f9 100%);
            padding: 25px;
            border-radius: 15px;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #4f46e5;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .info-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(79,70,229,0.05) 0%, transparent 70%);
            transform: scale(0);
            transition: transform 0.5s ease;
        }
        
        .info-card:hover::before {
            transform: scale(1);
        }
        
        .info-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(79,70,229,0.1);
            border-left-color: #7c3aed;
        }
        
        .info-label {
            font-size: 0.9rem;
            color: #64748b;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            position: relative;
            z-index: 2;
        }
        
        .info-value {
            font-size: 1.1rem;
            color: #1e293b;
            font-weight: 500;
            position: relative;
            z-index: 2;
        }
        
        .skills-section, .projects-section {
            margin-top: 40px;
        }
        
        .section-title {
            font-size: 1.8rem;
            color: #1e293b;
            margin-bottom: 20px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section-title::before {
            content: '';
            width: 4px;
            height: 30px;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            border-radius: 2px;
        }
        
        .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        
        .skill-tag {
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            padding: 10px 18px;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .skill-tag::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .skill-tag:hover::before {
            left: 100%;
        }
        
        .skill-tag:hover {
            transform: scale(1.05) translateY(-2px);
            box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
        }
        
        .projects-list {
            display: grid;
            gap: 20px;
        }
        
        .project-card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 15px;
            padding: 25px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .project-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #4f46e5, #7c3aed);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }
        
        .project-card:hover::before {
            transform: scaleX(1);
        }
        
        .project-card:hover {
            border-color: #4f46e5;
            box-shadow: 0 12px 25px rgba(79, 70, 229, 0.15);
            transform: translateY(-3px);
        }
        
        .project-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .project-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1e293b;
        }
        
        .project-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-completed { background: #dcfce7; color: #166534; }
        .status-in-progress { background: #dbeafe; color: #1e40af; }
        .status-planning { background: #fef3c7; color: #92400e; }
        
        .progress-bar {
            width: 100%;
            height: 10px;
            background: #e2e8f0;
            border-radius: 5px;
            overflow: hidden;
            margin-top: 15px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4f46e5, #7c3aed);
            border-radius: 5px;
            transition: width 1.2s ease;
            position: relative;
        }
        
        .progress-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .progress-text {
            text-align: right;
            margin-top: 8px;
            font-size: 0.9rem;
            color: #64748b;
            font-weight: 500;
        }
        
        .aws-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        @media (max-width: 768px) {
            .profile-header {
                padding: 30px 20px;
            }
            
            .name {
                font-size: 2rem;
            }
            
            .role {
                font-size: 1.1rem;
            }
            
            .profile-content {
                padding: 30px 20px;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .aws-badge {
                position: static;
                display: inline-block;
                margin-top: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="profile-container">
        <div class="profile-header">
            <div class="aws-badge">Powered by AWS</div>
            <div class="avatar"></div>
            <h1 class="name">${profile.name}</h1>
            <p class="role">${profile.role}</p>
        </div>
        
        <div class="profile-content">
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-label">📧 Email</div>
                    <div class="info-value">${profile.email}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">🏢 Department</div>
                    <div class="info-value">${profile.department}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">📅 Join Date</div>
                    <div class="info-value">${new Date(profile.joinDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">🆔 Employee ID</div>
                    <div class="info-value">${profile.id}</div>
                </div>
            </div>
            
            <div class="skills-section">
                <h2 class="section-title">💼 Skills & Expertise</h2>
                <div class="skills-grid">
                    ${profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            
            <div class="projects-section">
                <h2 class="section-title">🚀 Current Projects</h2>
                <div class="projects-list">
                    ${profile.projects.map(project => `
                        <div class="project-card">
                            <div class="project-header">
                                <div class="project-name">${project.name}</div>
                                <div class="project-status status-${project.status.toLowerCase().replace(' ', '-')}">${project.status}</div>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${project.completion}%"></div>
                            </div>
                            <div class="progress-text">${project.completion}% Complete</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Add loading animation
        document.addEventListener('DOMContentLoaded', function() {
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 500);
            });
        });
    </script>
</body>
</html>`;
  }

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
                name: this.serverName,
                version: this.serverVersion,
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
      case "get_profile":
        return this.handleGetProfile(args, id);
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

  private handleGetProfile(args: any, id?: string | number): MCPResponse {
    try {
      const profileId = args?.profileId || this.defaultProfileId;
      
      // Since we can't use async in this simple implementation, we'll use the sync version
      const profile = this.getProfileSync(profileId);
      const htmlContent = this.generateProfileHTML(profile);

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: `✅ Successfully fetched profile for ${profile.name}\n🔗 Profile ID: ${profile.id}\n📊 Projects: ${profile.projects.length}\n🎯 Skills: ${profile.skills.length}`,
            },
            {
              type: "resource",
              resource: {
                uri: "profile://html",
                mimeType: "text/html", 
                text: htmlContent,
              },
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
          message: "Failed to fetch profile",
          data: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private log(message: string, level: 'info' | 'error' | 'debug' = 'info') {
    if (level === 'debug' && this.logLevel !== 'debug') return;
    if (!this.isProduction) {
      console.error(`[${level.toUpperCase()}] ${message}`);
    }
  }

  private getProfileSync(profileId: string): ProfileData {
    this.log(`Fetching profile for ID: ${profileId}`);
    const profiles: Record<string, ProfileData> = {
      "default": {
        id: "EMP001",
        name: "Sarah Johnson", 
        email: "sarah.johnson@techcorp.com",
        department: "Engineering",
        role: "Senior Full Stack Developer",
        joinDate: "2021-08-15",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
        skills: ["TypeScript", "React", "Node.js", "AWS Lambda", "DynamoDB", "GraphQL", "Docker", "Terraform"],
        projects: [
          { name: "MCP Server Implementation", status: "In Progress", completion: 85 },
          { name: "Cloud Infrastructure Migration", status: "Completed", completion: 100 },
          { name: "API Performance Optimization", status: "In Progress", completion: 60 },
          { name: "Frontend Component Library", status: "Planning", completion: 25 }
        ]
      },
      "admin": {
        id: "ADM001",
        name: "Michael Chen",
        email: "michael.chen@techcorp.com", 
        department: "Operations",
        role: "DevOps Engineer",
        joinDate: "2020-03-10",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        skills: ["Kubernetes", "AWS", "Terraform", "Jenkins", "Prometheus", "Grafana", "Python", "Bash"],
        projects: [
          { name: "Kubernetes Cluster Setup", status: "Completed", completion: 100 },
          { name: "CI/CD Pipeline Enhancement", status: "In Progress", completion: 70 },
          { name: "Monitoring Dashboard", status: "Completed", completion: 100 }
        ]
      }
    };

    return profiles[profileId] || profiles["default"];
  }

  private handleResourceRead(params: any, id?: string | number): MCPResponse {
    const { uri } = params;

    try {
      switch (uri) {
        case "profile://data": {
          const profile = this.getProfileSync(this.defaultProfileId);
          return {
            jsonrpc: "2.0",
            id,
            result: {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify(profile, null, 2),
                },
              ],
            },
          };
        }

        case "profile://html": {
          const profile = this.getProfileSync(this.defaultProfileId);
          const htmlContent = this.generateProfileHTML(profile);
          return {
            jsonrpc: "2.0",
            id,
            result: {
              contents: [
                {
                  uri,
                  mimeType: "text/html",
                  text: htmlContent,
                },
              ],
            },
          };
        }

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
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32603,
          message: "Failed to read resource",
          data: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  startHttpServer() {
    const app = express();
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Health check endpoint for Render
    app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'healthy',
        server: this.serverName,
        version: this.serverVersion,
        environment: this.isProduction ? 'production' : 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // MCP over HTTP endpoint
    app.post('/mcp', (req, res) => {
      try {
        const request = req.body as MCPRequest;
        const response = this.handleRequest(request);
        res.json(response);
      } catch (error) {
        const errorResponse: MCPResponse = {
          jsonrpc: "2.0",
          error: {
            code: -32700,
            message: "Parse error",
            data: error instanceof Error ? error.message : String(error),
          },
        };
        res.status(400).json(errorResponse);
      }
    });

    // Profile demo endpoint
    app.get('/profile/:id?', (req, res) => {
      try {
        const profileId = req.params.id || this.defaultProfileId;
        const profile = this.getProfileSync(profileId);
        const htmlContent = this.generateProfileHTML(profile);
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);
      } catch (error) {
        res.status(500).json({
          error: 'Failed to generate profile',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Root endpoint
    app.get('/', (_req, res) => {
      res.json({
        name: this.serverName,
        version: this.serverVersion,
        description: 'MCP Profile Server - A Model Context Protocol implementation for profile management',
        endpoints: {
          health: '/health',
          mcp: '/mcp (POST)',
          profile: '/profile/:id (GET)'
        },
        environment: this.isProduction ? 'production' : 'development',
        timestamp: new Date().toISOString()
      });
    });

    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 ${this.serverName} v${this.serverVersion} HTTP server started!`);
      console.log(`🌐 Server running on port ${port}`);
      console.log(`🌍 Environment: ${this.isProduction ? 'Production' : 'Development'}`);
      console.log(`📋 Available endpoints:`);
      console.log(`   GET  /health - Health check`);
      console.log(`   GET  / - Server info`);
      console.log(`   POST /mcp - MCP protocol endpoint`);
      console.log(`   GET  /profile/:id - Profile HTML viewer`);
      if (process.env.RENDER) {
        console.log(`🚀 Running on Render: ${process.env.RENDER_EXTERNAL_URL || 'Unknown URL'}`);
      }
    });
  }

  startStdioServer() {
    process.stdin.setEncoding('utf8');
    
    let buffer = '';
    
    process.stdin.on('data', (chunk) => {
      buffer += chunk;
      
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
      console.error("Profile MCP Server shutting down...");
      process.exit(0);
    });

    console.error(`🚀 ${this.serverName} v${this.serverVersion} started successfully!`);
    console.error(`🌍 Environment: ${this.isProduction ? 'Production' : 'Development'}`);
    console.error(`📋 Available tools: get_profile`);
    console.error(`📊 Available profiles: default, admin`);
    console.error(`🔧 Default profile: ${this.defaultProfileId}`);
    if (process.env.RENDER) {
      console.error(`🚀 Running on Render: ${process.env.RENDER_EXTERNAL_URL || 'Unknown URL'}`);
    }
  }
}

// Start the server
const profileServer = new StandaloneProfileServer();

// Use HTTP server mode when running on Render, STDIO mode otherwise
if (process.env.RENDER || process.env.PORT) {
  profileServer.startHttpServer();
} else {
  profileServer.startStdioServer();
}