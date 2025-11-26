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

// Simulated AWS API response (replace with actual AWS SDK calls)
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

class ProfileServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "profile-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async fetchProfileFromAWS(profileId: string = "default"): Promise<ProfileData> {
    // Simulate AWS API call - replace with actual AWS SDK implementation
    // Example: const result = await dynamoClient.getItem({ TableName: 'profiles', Key: { id: profileId } });
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    // Mock data - replace with actual AWS response
    return {
      id: profileId,
      name: "John Doe",
      email: "john.doe@company.com",
      department: "Engineering",
      role: "Senior Software Engineer",
      joinDate: "2022-03-15",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      skills: ["TypeScript", "React", "Node.js", "AWS", "Docker", "Kubernetes"],
      projects: [
        { name: "MCP Server Implementation", status: "In Progress", completion: 75 },
        { name: "API Gateway Optimization", status: "Completed", completion: 100 },
        { name: "Frontend Redesign", status: "Planning", completion: 15 }
      ]
    };
  }

  private generateProfileHTML(profile: ProfileData): string {
    return `
<!DOCTYPE html>
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
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
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
        
        .avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 4px solid rgba(255,255,255,0.3);
            margin: 0 auto 20px;
            background: url('${profile.avatar}') center/cover;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        
        .name {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .role {
            font-size: 1.3rem;
            opacity: 0.9;
            font-weight: 300;
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
            background: #f8fafc;
            padding: 25px;
            border-radius: 15px;
            border-left: 4px solid #4f46e5;
            transition: transform 0.3s ease;
        }
        
        .info-card:hover {
            transform: translateY(-5px);
        }
        
        .info-label {
            font-size: 0.9rem;
            color: #64748b;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }
        
        .info-value {
            font-size: 1.1rem;
            color: #1e293b;
            font-weight: 500;
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
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 500;
            box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
            transition: transform 0.3s ease;
        }
        
        .skill-tag:hover {
            transform: scale(1.05);
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
        }
        
        .project-card:hover {
            border-color: #4f46e5;
            box-shadow: 0 8px 20px rgba(79, 70, 229, 0.1);
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
        }
        
        .status-completed { background: #dcfce7; color: #166534; }
        .status-in-progress { background: #dbeafe; color: #1e40af; }
        .status-planning { background: #fef3c7; color: #92400e; }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4f46e5, #7c3aed);
            border-radius: 4px;
            transition: width 0.8s ease;
        }
        
        .progress-text {
            text-align: right;
            margin-top: 8px;
            font-size: 0.9rem;
            color: #64748b;
            font-weight: 500;
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
        }
    </style>
</head>
<body>
    <div class="profile-container">
        <div class="profile-header">
            <div class="avatar"></div>
            <h1 class="name">${profile.name}</h1>
            <p class="role">${profile.role}</p>
        </div>
        
        <div class="profile-content">
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-label">Email</div>
                    <div class="info-value">${profile.email}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Department</div>
                    <div class="info-value">${profile.department}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Join Date</div>
                    <div class="info-value">${new Date(profile.joinDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Employee ID</div>
                    <div class="info-value">${profile.id}</div>
                </div>
            </div>
            
            <div class="skills-section">
                <h2 class="section-title">Skills & Expertise</h2>
                <div class="skills-grid">
                    ${profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            
            <div class="projects-section">
                <h2 class="section-title">Current Projects</h2>
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
</body>
</html>`;
  }

  private setupHandlers() {
    // Define available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
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
        ],
      };
    });

    // Define available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
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
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_profile": {
            const profileId = args?.profileId || "default";
            
            console.error(`Fetching profile for ID: ${profileId}`);
            
            // Fetch profile data from AWS
            const profileData = await this.fetchProfileFromAWS(profileId);
            
            // Generate HTML UI
            const htmlContent = this.generateProfileHTML(profileData);

            return {
              content: [
                {
                  type: "text",
                  text: `✅ Successfully fetched profile for ${profileData.name}`,
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
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Tool execution error:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to execute tool: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case "profile://data": {
            const profileData = await this.fetchProfileFromAWS("default");
            return {
              contents: [
                {
                  uri,
                  mimeType: "application/json",
                  text: JSON.stringify(profileData, null, 2),
                },
              ],
            };
          }

          case "profile://html": {
            const profileData = await this.fetchProfileFromAWS("default");
            const htmlContent = this.generateProfileHTML(profileData);
            return {
              contents: [
                {
                  uri,
                  mimeType: "text/html",
                  text: htmlContent,
                },
              ],
            };
          }

          default:
            throw new McpError(ErrorCode.InvalidParams, `Unknown resource: ${uri}`);
        }
      } catch (error) {
        console.error(`Resource read error:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to read resource: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    // Error handling
    this.server.onerror = (error: any) => {
      console.error("[MCP Error]", error);
    };

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.error("Shutting down MCP Profile Server...");
      await this.server.close();
      process.exit(0);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("MCP Profile Server started successfully");
  }
}

// Start the server
async function main() {
  const server = new ProfileServer();
  await server.start();
}

main().catch((error) => {
  console.error("Failed to start Profile MCP Server:", error);
  process.exit(1);
});