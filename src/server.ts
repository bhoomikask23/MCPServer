import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { AVAILABLE_MEDICINES } from './data.js';
import { MedicineData } from './types.js';
import { setUserToken, requireUserToken } from './getUserToken.js';

// ==================== EXPRESS APP SETUP ====================

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Configure CORS to allow requests from ChatGPT
app.use(cors({
  origin: ['https://chatgpt.com'],
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-mcp-session-id'],
  credentials: true
}));

// ==================== MCP SERVER SETUP ====================

const server = new McpServer({
  name: 'gallery-ts-mcp',
  version: '1.0.0'
});

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
});

// Global token storage (simple in-memory store for single-instance deployment)
const tokenStore = new Map<string, string>();
let currentAccessToken: string | null = null;

// ==================== HTML GENERATION ====================

/**
 * Generates HTML for the medicine carousel widget.
 * Creates a responsive carousel with navigation, FDA badges, and purchase links.
 * 
 * @param medicines - Array of medicine objects to display (defaults to all medicines)
 * @returns Complete HTML string ready for rendering in ChatGPT widget
 */
function createMedicineCarouselHTML(medicines = AVAILABLE_MEDICINES): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Medicine Carousel</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
      background: #f8fafc;
      padding: 20px;
    }
    .carousel-container { 
      width: 100%; 
      max-width: 600px;
      margin: 0 auto;
      overflow: hidden; 
      padding: 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .carousel-track { 
      display: flex; 
      gap: 0; 
      transition: transform 0.3s ease;
      width: ${medicines.length * 100}%;
    }
    .medicine-tile { 
      min-width: calc(100% / ${medicines.length});
      flex: 0 0 calc(100% / ${medicines.length});
      border: 1px solid #e5e7eb;
      border-radius: 24px;
      padding: 36px;
      background: white;
      display: flex;
      flex-direction: column;
      min-height: 500px;
      max-height: 540px;
    }
    .medicine-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .medicine-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .medicine-logo {
      width: 185px;
      height: auto;
    }
    .badge {
      display: flex;
      align-items: center;
      border: 1px solid #9ca3af;
      border-radius: 6px;
      padding: 8px 12px;
      width: 168px;
      font-size: 16px;
    }
    .badge-icon {
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }
    .fda-text {
      font-style: italic;
      font-size: 10px;
      color: #6b7280;
      margin: 16px 0;
    }
    .product-image-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 180px;
      max-height: 220px;
      margin: 20px 0;
      overflow: hidden;
    }
    .product-image {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .cta-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 20px;
      flex-shrink: 0;
    }
    .delivery-badge {
      display: inline-flex;
      align-items: center;
      border: 1px solid #9ca3af;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 16px;
    }
    .buy-button {
      background-color: rgb(255, 37, 27);
      color: white;
      border: none;
      border-radius: 9999px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 180px;
      cursor: pointer;
      transition: background-color 0.2s;
      gap: 8px;
    }
    .buy-button:hover {
      background-color: rgb(220, 30, 22);
    }
    .arrow-icon {
      width: 16px;
      height: 16px;
      fill: white;
    }
    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.9);
      border: none;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      cursor: pointer;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10;
    }
    .nav-prev { left: 20px; }
    .nav-next { right: 20px; }
    .carousel-wrapper {
      position: relative;
    }
    .status {
      text-align: center;
      color: #374151;
      margin-bottom: 20px;
      font-weight: 500;
      font-size: 18px;
    }
    .auth-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px;
      text-align: center;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .auth-banner a {
      color: white;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="carousel-container">
    <div class="auth-banner">
      🔐 <a href="/auth-status">Check your login status</a> for personalized medicine recommendations
    </div>
    <div class="status">💊 Available Medicines • ${medicines.length} FDA-Approved Options</div>
    <div class="carousel-wrapper">
      <div class="carousel-track" id="carousel-track">
        ${medicines.map(medicine => `
          <div class="medicine-tile">
            <div class="medicine-content">
              <div class="medicine-header">
                <div>
                  <img src="${medicine.logo}" alt="${medicine.name}" class="medicine-logo">
                </div>
                <div class="badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" class="badge-icon">
                    <path d="M183.31,188l22.35-22.34a8,8,0,0,0-11.32-11.32L172,176.69l-41.15-41.16A52,52,0,0,0,124,32H72a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V136h28.69l52,52-22.35,22.34a8,8,0,0,0,11.32-11.32L172,199.31l22.34,22.35a8,8,0,0,0,11.32-11.32ZM80,48h44a36,36,0,0,1,0,72H80Z"></path>
                  </svg>
                  <span>FDA-approved</span>
                </div>
              </div>
              <div class="fda-text">FDA-approved</div>
              <div class="product-image-container">
                <img src="${medicine.image}" alt="${medicine.name}" class="product-image">
              </div>
            </div>
            <div class="cta-bar">
              <div class="delivery-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" class="badge-icon">
                  <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z"></path>
                </svg>
                <span>Free delivery</span>
              </div>
              <a href="${medicine.buyLink}" target="_blank" class="buy-button">
                ${medicine.buyLinkText}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 256 256" class="arrow-icon">
                  <path d="m221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
                </svg>
              </a>
            </div>
          </div>
        `).join('')}
      </div>
      ${medicines.length > 1 ? `
        <button class="nav-button nav-prev" onclick="scrollCarousel(-1)">←</button>
        <button class="nav-button nav-next" onclick="scrollCarousel(1)">→</button>
      ` : ''}
    </div>
  </div>
  
  <script>
    let currentIndex = 0;
    const maxIndex = ${medicines.length - 1};
    const slideWidth = 100 / ${medicines.length};
    
    function scrollCarousel(direction) {
      if (${medicines.length} <= 1) return;
      
      currentIndex = Math.max(0, Math.min(maxIndex, currentIndex + direction));
      const track = document.getElementById('carousel-track');
      track.style.transform = 'translateX(-' + (currentIndex * slideWidth) + '%)';
      
      if (window.oai && window.oai.widget && typeof window.oai.widget.setState === 'function') {
        window.oai.widget.setState({
          currentIndex: currentIndex,
          viewMode: 'medicine-carousel',
          medicineCount: ${medicines.length}
        });
      }
    }
    
    console.log('Medicine carousel loaded with ${medicines.length} items');
  </script>
</body>
</html>`;
}

// ==================== UI RESOURCES ====================

// Medicine Carousel Resource (All medicines)
server.registerResource(
  'medicine-carousel',
  'ui://widget/medicine-carousel.html',
  {},
  async () => ({
    contents: [
      {
        uri: 'ui://widget/medicine-carousel.html',
        mimeType: 'text/html+skybridge',
        text: createMedicineCarouselHTML()
      },
    ],
  })
);

// Single Medicine Resource  
server.registerResource(
  'single-medicine',
  'ui://widget/single-medicine.html',
  {},
  async () => ({
    contents: [
      {
        uri: 'ui://widget/single-medicine.html',
        mimeType: 'text/html+skybridge',
        text: createMedicineCarouselHTML([AVAILABLE_MEDICINES[0]]) // Default to first medicine
      },
    ],
  })
);

server.registerResource(
  'user-profile-dynamic',
  'ui://widget/user-profile-dynamic.html',
  {},
  async () => ({
    contents: [
      {
        uri: 'ui://widget/user-profile-dynamic.html',
        mimeType: 'text/html+skybridge',
        text: `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>User Profile</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f8fafc;padding:20px}
    .card{background:#fff;padding:28px;border-radius:12px;max-width:420px;margin:0 auto;text-align:center;box-shadow:0 6px 24px rgba(2,6,23,0.08)}
    .icon{width:72px;height:72px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-size:28px;margin-bottom:16px}
    .message{font-size:22px;font-weight:600;margin-bottom:6px}
    .timestamp{color:#718096;margin-bottom:12px;font-family:monospace}
    .badge{display:inline-flex;padding:6px 12px;border-radius:16px;background:#e6f7ff;color:#0066cc;font-weight:600}
  </style>
</head>
<body>
  <!-- optional skeleton; keep dimensions stable -->
  <div id="skeleton" aria-busy="true" style="max-width:420px;margin:0 auto">
    <div class="card">Loading static data…</div>
  </div>

  <!-- real UI stays hidden until data is ready -->
  <div id="root" hidden></div>

  <script>
    const root = document.getElementById('root');
    const skeleton = document.getElementById('skeleton');

    function renderIfReady() {
      const out = window.openai?.toolOutput || {};
      const data = out.userData || null;      // <-- your tool shape

      if (!data) return; // not ready yet; keep skeleton

      const message = data.message ?? 'No message';
      const timestamp = data.timestamp ?? '';
      const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : '';

      root.innerHTML = \`
        <div class="card">
          <div class="icon">📡</div>
          <div class="message">\${message}</div>
          <div class="timestamp">\${formattedTime}</div>
          <div class="badge">✓ Static Data</div>
        </div>\`;

      // swap skeleton -> real content with no flicker
      skeleton.hidden = true;
      root.hidden = false;
    }

    // 1) Try immediately (covers the case where toolOutput is already present)
    renderIfReady();

    // 2) Re-try when the host provides globals
    window.addEventListener('openai:set_globals', renderIfReady);

    // 3) Optional: also re-try after tool executions initiated from inside the widget
    window.addEventListener('openai:tool_response', renderIfReady);
  </script>
</body>
</html>`
      },
    ],
  })
);


// ==================== TOOLS ====================

/**
 * Tool: Show All Medicines
 * Displays all available FDA-approved medicines in an interactive carousel.
 * No authentication required - public tool accessible to all users.
 */
server.registerTool(
  'show-all-medicines',
  {
    title: 'Show All Available Medicines',
    description: 'Display all available FDA-approved medicines in a carousel view',
    _meta: {
      'openai/outputTemplate': 'ui://widget/medicine-carousel.html',
      'openai/toolInvocation/invoking': 'Loading available medicines...',
      'openai/toolInvocation/invoked': 'Medicines carousel loaded successfully',
      'securitySchemes': [
        { type: 'oauth2', scopes: ['openid', 'profile'] }
      ]
    },
    inputSchema: {}
  },
  async () => {
    const medicineData: MedicineData = {
      items: AVAILABLE_MEDICINES,
      total_count: AVAILABLE_MEDICINES.length
    };
    
    return {
      content: [
        { 
          type: 'text', 
          text: `Displaying ${AVAILABLE_MEDICINES.length} FDA-approved medicines available for purchase.`
        }
      ],
      structuredContent: medicineData
    };
  }
);

/**
 * Tool: Get User Profile
 * Fetches authenticated user profile data from AWS API Gateway.
 * Requires OAuth authentication - uses user's token from ChatGPT.
 * Returns user profile data to render in the user-profile widget.
 */
server.registerTool(
  'get-user-profile',
  {
    title: 'Get User Profile',
    description: 'Fetch authenticated user profile from AWS API using the user\'s ChatGPT OAuth token',
    _meta: {
      'openai/outputTemplate': 'ui://widget/user-profile-dynamic.html',
      'openai/toolInvocation/invoking': 'Fetching user profile...',
      'openai/toolInvocation/invoked': 'User profile loaded successfully'
    },
    inputSchema: {}
  },
  async () => {
    const userToken = requireUserToken();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('https://f7bm2iixd1.execute-api.ap-southeast-2.amazonaws.com/prod/static', {
        method: 'GET',
        headers: { 
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', response.status, errorText);
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        content: [{ type: 'text', text: `Static data received: ${data.message} at ${data.timestamp}` }],
        structuredContent: { userData: data }
      };
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error.message);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }
);

/**
 * Tool: Show Single Medicine
 * Displays detailed information about a specific medicine by name.
 * Supports optional authentication for personalized experience.
 * Creates dynamic HTML resource with the selected medicine details.
 */
server.registerTool(
  'show-medicine',
  {
    title: 'Show Specific Medicine',
    description: 'Display information about a specific medicine',
    _meta: {
      'openai/outputTemplate': 'ui://widget/single-medicine.html',
      'openai/toolInvocation/invoking': 'Loading medicine information...',
      'openai/toolInvocation/invoked': 'Medicine information loaded successfully',
      'securitySchemes': [
        { type: 'noauth' },
        { type: 'oauth2', scopes: ['openid', 'profile'] }
      ]
    },
    inputSchema: {
      medicineName: z.string().describe('Name of the medicine to display')
    }
  },
  async (args: any) => {
    const medicine = AVAILABLE_MEDICINES.find(med => 
      med.name.toLowerCase().includes(args.medicineName.toLowerCase())
    );
    
    if (!medicine) {
      return {
        content: [
          { 
            type: 'text', 
            text: `Medicine "${args.medicineName}" not found. Available medicines: ${AVAILABLE_MEDICINES.map(m => m.name).join(', ')}`
          }
        ],
        structuredContent: { items: [], total_count: 0, medicineName: args.medicineName }
      };
    }

    // Update the single medicine resource with the selected medicine
    const singleMedicineHTML = createMedicineCarouselHTML([medicine]);
    
    // Create a dynamic resource
    const dynamicResource = {
      uri: 'ui://widget/single-medicine.html',
      mimeType: 'text/html+skybridge',
      text: singleMedicineHTML
    };

    const medicineData: MedicineData = {
      items: [medicine],
      total_count: 1,
      medicineName: medicine.name
    };
    
    return {
      content: [
        { 
          type: 'text', 
          text: `Displaying information for ${medicine.name} - FDA-approved medicine available for purchase.`
        }
      ],
      structuredContent: medicineData,
      _meta: {
        'openai/dynamicContent': dynamicResource
      }
    };
  }
);

// ==================== HTTP ENDPOINTS ====================

/**
 * Health Check Endpoint
 * Simple endpoint to verify server is running and responding.
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

/**
 * OAuth Protected Resource Metadata Endpoint
 * Required by ChatGPT Apps SDK for OAuth discovery.
 * Advertises this server's resource URL and supported authorization servers.
 * Must match Auth0 API Identifier exactly.
 */
app.get('/.well-known/oauth-protected-resource', (req, res) => {
  const issuerURL = process.env.AUTH0_ISSUER_BASE_URL;
  const audience = process.env.AUTH0_AUDIENCE; // Use audience as resource URL
  
  if (!issuerURL || !audience) {
    return res.status(503).json({
      error: 'server_misconfig',
      message: 'Set AUTH0_ISSUER_BASE_URL and AUTH0_AUDIENCE env vars'
    });
  }
  
  console.log('📋 PRM endpoint called - advertising resource:', audience);
  
  res.json({
    resource: audience, // MUST match the API Identifier in Auth0 EXACTLY
    authorization_servers: [issuerURL],
    scopes_supported: ['openid', 'profile', 'email'],
    bearer_methods_supported: ['header']
  });
});

/**
 * Token Verification Middleware
 * Extracts OAuth token from Authorization header and stores it for tool use.
 * Non-blocking - allows all requests through, tools enforce auth as needed.
 */
async function verifyToken(req: Request, res: Response, next: any) {
  const authHeader = req.headers.authorization;
  
  console.log('verifyToken middleware:', {
    hasAuthHeader: !!authHeader,
    authHeaderValue: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
    method: req.method,
    path: req.path
  });
  
  if (!authHeader) {
    console.log('ℹ️ No auth header - anonymous access allowed');
    currentAccessToken = null;
    setUserToken(null);
    return next();
  }
  
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token || token === authHeader) {
    console.log('⚠️ Invalid auth header format - continuing without authentication');
    currentAccessToken = null;
    setUserToken(null);
    return next();
  }
  
  // Store token directly without any verification or analysis
  console.log('✅ Token received - storing for API calls');
  
  (req as any).accessToken = token;
  currentAccessToken = token;
  setUserToken(token);
  
  return next();
}

/**
 * MCP Protocol Endpoint
 * Main endpoint for Model Context Protocol communication with ChatGPT.
 * Handles tool invocations, resource requests, and prompt interactions.
 * Uses verifyToken middleware to extract and store OAuth tokens.
 */
app.all('/mcp', express.json(), verifyToken, async (req: Request, res: Response) => {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('MCP request error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// ==================== SERVER STARTUP ====================

/**
 * Starts the MCP server and HTTP listener.
 * Connects MCP server to HTTP transport and binds to configured port.
 */
async function startServer() {
  try {
    await server.connect(transport);
    console.log('✅ MCP server connected to transport');
    
    // Start HTTP server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Medicine Carousel MCP Server running on port ${PORT}`);
      console.log(`💊 Available medicines: ${AVAILABLE_MEDICINES.length} FDA-approved options`);
      console.log(` Ready for ChatGPT Apps integration with OAuth 2.1 + PKCE`);
    });
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

startServer();

export default app;