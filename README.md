# MCP Server Connection

A TypeScript implementation of a Model Context Protocol (MCP) server that provides tools and resources for AI assistants like ChatGPT.

## Features

- **Profile Tool**: Fetch user profiles from AWS with beautiful HTML interface
- **Echo Tool**: Echo back provided text
- **Time Tool**: Get current date and time
- **Calculator Tool**: Perform safe arithmetic calculations
- **Server Resources**: Access server information and capabilities
- **Cloud Ready**: Optimized for Render.com deployment

## Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/bhoomikask23/MCPServer.git
   cd MCPServer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## Usage

### 🚀 Cloud Deployment (Render)

**Quick Deploy to Render:**

1. Fork this repository
2. Connect to Render.com
3. Set environment variables (see [DEPLOYMENT.md](./DEPLOYMENT.md))
4. Deploy with one click!

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/bhoomikask23/MCPServer)

### 💻 Local Development

1. **Start the profile server:**

   ```bash
   npm run start:standalone
   ```

2. **Start the basic server:**
   ```bash
   npm start
   ```

### 🤖 ChatGPT Integration

- Add this MCP server to your ChatGPT configuration
- Use the deployed Render URL or local path
- Configure via your MCP client settings

### Available Tools

- **get_profile**: Fetch user profiles with beautiful HTML display
- **echo**: Echo back any text you provide
- **get_current_time**: Get the current timestamp
- **calculate**: Perform arithmetic calculations (supports +, -, \*, /, parentheses)

### Available Resources

- **server://info**: Get server information and status
- **server://capabilities**: List all available tools and resources

## Development

```bash
# Development mode with auto-reload
npm run dev

# Profile server development
npm run dev:standalone

# Clean build files
npm run clean

# Build for production
npm run build

# Deploy to Render
npm run render-build && npm run render-start
```

## 🌐 Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Key Environment Variables

- `NODE_ENV`: Set to 'production' for Render
- `AWS_REGION`: Your AWS region for profile data
- `DEFAULT_PROFILE_ID`: Default profile to load
- `LOG_LEVEL`: Logging level (info, debug, error)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

## Security

This server uses safe evaluation methods for calculations and includes input sanitization to prevent code injection attacks.

## Requirements

- Node.js >= 18.0.0
- npm or yarn

## License

MIT
