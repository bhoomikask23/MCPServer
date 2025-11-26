# 🚀 Render Deployment Guide for MCP Server

This guide will help you deploy your MCP (Model Context Protocol) server to Render.com.

## 📋 Prerequisites

- GitHub account with this repository
- Render account (free tier available)
- AWS account (optional, for AWS features)

## 🔧 Environment Variables

### Required Environment Variables for Render

Set these in your Render dashboard under "Environment Variables":

```bash
# Basic Configuration
NODE_ENV=production
LOG_LEVEL=info
DEFAULT_PROFILE_ID=default

# AWS Configuration (Optional - for profile server with real AWS)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_aws_access_key
AWS_SECRET_ACCESS_KEY=your_actual_aws_secret_key
DYNAMODB_TABLE_NAME=user_profiles

# Feature Flags (Optional)
ENABLE_CALCULATOR_TOOL=true
ENABLE_ECHO_TOOL=true
ENABLE_TIME_TOOL=true
ENABLE_PROFILE_TOOL=true
```

### Auto-Set by Render

These are automatically set by Render:

- `PORT` (usually 10000)
- `RENDER=true`
- `RENDER_EXTERNAL_URL`
- `RENDER_INSTANCE_ID`

## 🚀 Deployment Steps

### Method 1: Using Render Dashboard (Recommended)

1. **Connect Repository**

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `https://github.com/bhoomikask23/MCPServer`

2. **Configure Service**

   ```
   Name: mcp-server-connection
   Environment: Node
   Branch: main
   Root Directory: (leave blank)
   Build Command: npm run render-build
   Start Command: npm run render-start
   ```

3. **Set Environment Variables**

   - Add the environment variables listed above
   - Start with minimal config (NODE_ENV=production)
   - Add AWS variables later if needed

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (usually 2-5 minutes)

### Method 2: Using render.yaml (Infrastructure as Code)

1. **Deploy with render.yaml**

   - The repository already includes `render.yaml`
   - Go to Render → "Blueprint" → "New Blueprint Instance"
   - Connect repository and deploy

2. **Manual Environment Setup**
   - Set environment variables in Render dashboard after deployment

## 🧪 Testing Your Deployment

### 1. Health Check

Your MCP server will be available at: `https://your-app-name.onrender.com`

### 2. Test MCP Protocol

```bash
# Test with curl (the server uses STDIO, so direct HTTP won't work)
# You'll need to integrate with a MCP client like ChatGPT
```

### 3. Check Logs

- Go to Render Dashboard → Your Service → Logs
- Look for: "Standalone Profile MCP Server started successfully!"

## 🔗 Integration with ChatGPT

### MCP Client Configuration

Add to your MCP client configuration:

```json
{
  "servers": {
    "profile-server": {
      "command": "node",
      "args": ["/path/to/your/mcp/client", "https://your-app.onrender.com"],
      "env": {
        "MCP_SERVER_URL": "https://your-app.onrender.com"
      }
    }
  }
}
```

### Available Tools

1. **get_profile** - Fetches user profile with beautiful HTML display
   ```json
   {
     "name": "get_profile",
     "arguments": {
       "profileId": "default" // or "admin"
     }
   }
   ```

### Available Resources

1. **profile://data** - Raw profile JSON data
2. **profile://html** - Formatted HTML profile display

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Check if all dependencies are installed
   npm install
   npm run build
   ```

2. **Environment Variable Issues**

   - Ensure all required variables are set in Render dashboard
   - Check logs for "undefined" environment values

3. **Port Issues**

   - Render automatically sets PORT
   - Don't hardcode port in your application

4. **Memory Issues**
   - Free tier has 512MB RAM limit
   - Optimize your application or upgrade plan

### Debugging Steps

1. **Check Render Logs**

   - Dashboard → Service → Logs tab
   - Look for startup messages and errors

2. **Verify Environment**

   ```javascript
   console.log("Environment:", process.env.NODE_ENV);
   console.log("Render URL:", process.env.RENDER_EXTERNAL_URL);
   ```

3. **Test Locally First**
   ```bash
   npm run build
   npm run render-start
   ```

## 🔄 Updates and Redeploy

### Automatic Deployment

- Push to `main` branch triggers automatic redeployment
- Check "Auto-Deploy" is enabled in Render settings

### Manual Deployment

- Render Dashboard → Service → "Manual Deploy" → "Deploy latest commit"

## 📈 Monitoring

### Built-in Render Monitoring

- CPU and Memory usage in dashboard
- Response time metrics
- Error rate tracking

### Custom Logging

```typescript
// Your app already includes structured logging
console.error("[INFO] Server started");
console.error("[ERROR] Something failed");
```

## 🔒 Security Considerations

1. **Environment Variables**

   - Never commit `.env` files
   - Use Render's encrypted environment variables
   - Rotate AWS keys regularly

2. **HTTPS**

   - Render provides free SSL certificates
   - All traffic is automatically HTTPS

3. **Rate Limiting**
   - Consider implementing rate limiting for production
   - Monitor usage in Render dashboard

## 💰 Costs

### Free Tier Limits

- 750 hours/month (enough for one 24/7 service)
- 512MB RAM
- Sleeps after 15 minutes of inactivity

### Paid Plans

- Starter: $7/month (no sleep, more resources)
- Standard: $25/month (more RAM, better performance)

## 🆘 Support

### Resources

- [Render Documentation](https://render.com/docs)
- [MCP Protocol Docs](https://modelcontextprotocol.io)
- [GitHub Issues](https://github.com/bhoomikask23/MCPServer/issues)

### Quick Commands

```bash
# Local development
npm run dev:standalone

# Production build
npm run render-build

# Start production server
npm run render-start

# View logs
# Use Render dashboard logs tab
```

---

🎉 **Success!** Your MCP server should now be running on Render and ready for integration with ChatGPT or other MCP clients!
