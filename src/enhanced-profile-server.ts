#!/usr/bin/env node

/**
 * Enhanced Profile MCP Server with HTTP Transport and OAuth
 * Based on medicine carousel server architecture
 * Supports ChatGPT Apps integration with beautiful HTML widgets
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

// ==================== TYPES ====================

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
    name: string
    status: string;
    completion: number;
  }>;
}

// Only declare the environment variables we actually use
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV?: string;
      DEFAULT_PROFILE_ID?: string;
    }
  }
}

// ==================== MOCK DATA ====================

const PROFILE_DATABASE: Record<string, ProfileData> = {
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

// ==================== EXPRESS APP SETUP ====================

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Configure CORS to allow requests from ChatGPT
app.use(cors({
  origin: ['https://chatgpt.com', 'https://chat.openai.com'],
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-mcp-session-id'],
  credentials: true
}));

// ==================== MCP SERVER SETUP ====================

const server = new Server(
  {
    name: 'profile-mcp-server-enhanced',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// ==================== HTML GENERATION ====================

/**
 * Generates enhanced HTML for profile display widget
 * Creates a responsive profile card with animations and modern design
 */
function createProfileHTML(profile: ProfileData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Employee Profile - ${profile.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      overflow: hidden;
      animation: slideUp 0.6s ease-out;
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .profile-header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 40px;
      text-align: center;
      color: white;
      position: relative;
    }
    
    .avatar-container {
      position: relative;
      display: inline-block;
      margin-bottom: 20px;
    }
    
    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 4px solid rgba(255,255,255,0.3);
      background: url('${profile.avatar}') center/cover;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }
    
    .online-indicator {
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 24px;
      height: 24px;
      background: #10b981;
      border: 3px solid white;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .name { font-size: 2.5rem; font-weight: 700; margin-bottom: 10px; }
    .role { font-size: 1.3rem; opacity: 0.9; font-weight: 300; }
    
    .profile-content { padding: 40px; }
    
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
      border-left: 4px solid #4f46e5;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .info-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(79,70,229,0.1);
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
    }
    
    .progress-text {
      text-align: right;
      margin-top: 8px;
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }
    
    .stats-bar {
      display: flex;
      justify-content: space-around;
      padding: 20px;
      background: #f8fafc;
      border-radius: 12px;
      margin-top: 30px;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #4f46e5;
    }
    
    .stat-label {
      font-size: 0.9rem;
      color: #64748b;
      margin-top: 5px;
    }
    
    @media (max-width: 768px) {
      .profile-header { padding: 30px 20px; }
      .name { font-size: 2rem; }
      .role { font-size: 1.1rem; }
      .profile-content { padding: 30px 20px; }
      .info-grid { grid-template-columns: 1fr; gap: 20px; }
    }
  </style>
</head>
<body>
  <div class="profile-container">
    <div class="profile-header">
      <div class="avatar-container">
        <div class="avatar"></div>
        <div class="online-indicator"></div>
      </div>
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
      
      <div class="projects-section" style="margin-top: 40px;">
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
      
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-number">${profile.projects.length}</div>
          <div class="stat-label">Projects</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${profile.skills.length}</div>
          <div class="stat-label">Skills</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${Math.round(profile.projects.reduce((sum, p) => sum + p.completion, 0) / profile.projects.length)}%</div>
          <div class="stat-label">Avg Progress</div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // Initialize animations
    document.addEventListener('DOMContentLoaded', function() {
      const progressBars = document.querySelectorAll('.progress-fill');
      progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
          bar.style.width = width;
        }, 500);
      });
      
      // Report widget state to ChatGPT
      if (window.openai && window.openai.widget) {
        console.log('Profile widget loaded for ${profile.name}');
      }
    });
  </script>
</body>
</html>`;
}

// ==================== UI RESOURCES ====================

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'profile://widget',
        mimeType: 'text/html',
        name: 'Profile Widget',
        description: 'Interactive profile display widget',
      },
    ],
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
  const { uri } = request.params;

  switch (uri) {
    case 'profile://widget': {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/html',
            text: createProfileHTML(PROFILE_DATABASE.default),
          },
        ],
      };
    }
    default:
      throw new McpError(ErrorCode.InvalidParams, `Unknown resource: ${uri}`);
  }
});

// ==================== TOOLS ====================

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_profile',
        description: 'Fetch and display employee profile with beautiful HTML interface',
        inputSchema: {
          type: 'object',
          properties: {
            profileId: {
              type: 'string',
              description: 'Profile ID to fetch (default, admin, or employee ID)',
            },
          },
        },
      },
      {
        name: 'calculate_stats',
        description: 'Calculate various statistics from profile data',
        inputSchema: {
          type: 'object',
          properties: {
            calculation: {
              type: 'string',
              enum: ['average_completion', 'total_projects', 'completion_rate', 'time_at_company'],
              description: 'Type of calculation to perform',
            },
            profileId: {
              type: 'string',
              description: 'Profile ID to calculate for',
            },
          },
          required: ['calculation'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_profile': {
        const profileId = args?.profileId || process.env.DEFAULT_PROFILE_ID || 'default';
        
        // Simulate AWS API call (replace with real AWS integration)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const profile = PROFILE_DATABASE[profileId] || PROFILE_DATABASE.default;
        const profileHTML = createProfileHTML(profile);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `✅ Profile loaded for ${profile.name} (${profile.id}) from ${profile.department} department\n\n${profileHTML}`
            }
          ],
        };
      }

      case 'calculate_stats': {
        const profileId = args?.profileId || 'default';
        const profile = PROFILE_DATABASE[profileId] || PROFILE_DATABASE.default;
        
        let result: number;
        let description: string;
        
        switch (args.calculation) {
          case 'average_completion':
            result = Math.round(profile.projects.reduce((sum, p) => sum + p.completion, 0) / profile.projects.length);
            description = `Average project completion rate for ${profile.name}`;
            break;
          case 'total_projects':
            result = profile.projects.length;
            description = `Total number of projects for ${profile.name}`;
            break;
          case 'completion_rate':
            const completed = profile.projects.filter(p => p.status === 'Completed').length;
            result = Math.round((completed / profile.projects.length) * 100);
            description = `Percentage of completed projects for ${profile.name}`;
            break;
          case 'time_at_company':
            const joinDate = new Date(profile.joinDate);
            const now = new Date();
            result = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
            description = `Years at company for ${profile.name}`;
            break;
          default:
            throw new McpError(ErrorCode.InvalidParams, 'Invalid calculation type');
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `${description}: ${result}${args.calculation === 'completion_rate' || args.calculation === 'average_completion' ? '%' : args.calculation === 'time_at_company' ? ' years' : ''}`
            }
          ]
        };
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

// ==================== HTTP ENDPOINTS ====================

/**
 * Health Check
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    profiles: Object.keys(PROFILE_DATABASE).length,
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== ERROR HANDLING ====================

server.onerror = (error: any) => {
  console.error('[MCP Error]', error);
};

process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

// ==================== SERVER STARTUP ====================

async function startServer() {
  try {
    // Start HTTP server for health checks
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 HTTP Health server running on port ${PORT}`);
      console.log(`👥 Available profiles: ${Object.keys(PROFILE_DATABASE).join(', ')}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Start MCP server with STDIO transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('✅ Enhanced Profile MCP server started successfully');
    console.error('💼 Ready for ChatGPT integration with beautiful HTML profiles');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;