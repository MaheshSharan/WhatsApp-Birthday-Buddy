# WhatsApp Birthday Buddy 🎂

> A smart WhatsApp bot that helps you never miss a birthday! Features automatic wishes, AFK responses, and birthday management - all with privacy in mind. Built with Node.js and WhatsApp Web API.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/MaheshSharan/WhatsApp-Birthday-Buddy-?style=social)](https://github.com/MaheshSharan/WhatsApp-Birthday-Buddy-/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/MaheshSharan/WhatsApp-Birthday-Buddy-?style=social)](https://github.com/MaheshSharan/WhatsApp-Birthday-Buddy-/network/members)
[![GitHub issues](https://img.shields.io/github/issues/MaheshSharan/WhatsApp-Birthday-Buddy-)](https://github.com/MaheshSharan/WhatsApp-Birthday-Buddy-/issues)

## Features

### 🎂 Birthday Management
- Add, remove, and list birthdays with ease
- Automatic personalized birthday wishes at midnight
- Bulk import through CSV files
- Birthday statistics and distribution tracking

### 🤖 AI Assistant
- Powered by Qwen2.5-72B-Instruct model
- Smart contextual conversations
- Special handling for thank you messages
- Concise and accurate responses

### 🎯 Sticker Creation
- Quick commands: `!sticker` or `!s`
- Background removal with remove.bg API
- Support for both images and videos
- Options: `nobg`, `circle`
- Clean chat with in-place message editing

### 🌙 Smart AFK System
- Auto-respond when you're away
- Intelligent message filtering
- Auto-disable when owner returns
- Separate owner notifications
- Promotional message detection

### 🛡️ Security & Privacy
- Local data storage
- Phone number validation
- Suspicious number detection
- Business message filtering
- Comprehensive security logging

### 📊 Performance Monitoring
- Real-time uptime tracking
- Memory usage statistics
- Node version information
- Birthday distribution analytics
- Command usage tracking

## Command Reference

| Command | Format | Description |
|---------|--------|-------------|
| Add Birthday | `@smartbot addBD.Name,DD/MM/YYYY,+PhoneNumber` | Add a new birthday |
| Remove Birthday | `@smartbot removeBD.+PhoneNumber` | Remove a birthday |
| List Birthdays | `@smartbot listBD` | Show all birthdays |
| Enable AFK | `@smartbot AFK` | Enable away mode |
| Disable AFK | `@smartbot AFKOFF` | Disable away mode |
| Status | `@smartbot status` | Show bot statistics |
| Create Sticker | `@smartbot !sticker` or `!s` | Create sticker from media |
| Remove BG Sticker | `@smartbot !sticker nobg` | Create sticker without background |
| Circular Sticker | `@smartbot !sticker circle` | Create circular sticker |
| Bulk Import | Send CSV with `@smartbot importBD` | Import multiple birthdays |

### Media Handling
- Support for quoted messages
- Caption processing in media
- Temporary file management
- Multiple media format support
- Automatic cleanup

### Bulk Birthday Import

CSV format requirements:
```csv
Name,Birthday,PhoneNumber
John Doe,25/12/1990,+1234567890
Jane Smith,01/01/1995,+9876543210
```

**Requirements:**
- Header: `Name,Birthday,PhoneNumber`
- Date format: `DD/MM/YYYY`
- Phone: Country code with `+`
- No spaces in CSV (except names)

## Environment Variables

Create a `.env` file:
```env
# AI Configuration
HUGGINGFACE_API_KEY=your_api_key_here

# Background Removal
REMOVE_BG_API_KEY=your_api_key_here

# Database Configuration
DB_PATH=./database/birthday.db

# Bot Configuration
BOT_PREFIX=@smartbot

# Owner Configuration
OWNER_NUMBER=911234567890  # Without +
```

## 🚀 Quick Start

### Local Development
Follow the [Manual Deployment](#manual-deployment) section below for local development setup.

### Production Deployment
For production deployment on Render, follow our detailed [Production Deployment Guide](DEPLOYMENT.md).

> ⚠️ **Important**: For production deployment, you must first run the bot locally to generate authentication files. These files should be committed to your private repository before deploying to Render.

## Deployment

### Prerequisites
- Docker and Docker Compose installed (for Docker deployment)
- Node.js 18 or higher (for local development)
- Required API keys (HuggingFace, Remove.bg)
- Git for version control
- A Render account (for production deployment)

### Using Docker (Recommended for Local Development)
1. Clone the repository:
   ```bash
   git clone https://github.com/MaheshSharan/WhatsApp-Birthday-Buddy.git
   cd WhatsApp-Birthday-Buddy
   ```

2. Create environment file:
   ```bash
   cp env.template .env
   ```
   Edit `.env` with your configuration.

3. Build and run using Docker Compose:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment (Local Development)
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   - Copy `env.template` to `.env`
   - Edit `.env` with your configuration

3. Start the bot:
   ```bash
   npm start
   ```

### Production Deployment
For production deployment on Render:

1. First, follow the local deployment steps above to generate authentication files
2. Create a private fork of this repository
3. Commit your authentication files to your private repository
4. Follow our [Production Deployment Guide](DEPLOYMENT.md) for detailed Render deployment instructions

### Important Notes
- Ensure all required API keys are configured
- The bot requires persistent storage for:
  - WhatsApp session data (`auth_info_baileys/`)
  - Database (`database/`)
  - Logs (`logs/`)
  - Temporary files (`temp/`)
- Monitor the logs for any issues
- Keep your dependencies updated
- For production:
  - Always use a private repository
  - Secure your authentication files
  - Monitor the health endpoint
  - Set up proper environment variables

## Architecture

The bot follows a modular architecture:

```mermaid
graph TD
    A[WhatsApp Web API] --> B[Connection Handler]
    B --> C[Message Router]
    C --> D[Command Handler]
    C --> E[AFK Handler]
    C --> F[Sticker Service]
    C --> G[AI Service]
    D --> H[Birthday Service]
    H --> I[Database]
    E --> I
```

### Core Components
- Connection Handler: Manages WhatsApp Web connection using Baileys
- Message Router: Routes messages to appropriate handlers
- Command Handler: Processes user commands
- Birthday Service: Manages birthday operations
- Sticker Service: Handles sticker creation
- AI Service: Manages conversations
- Database: SQLite storage for data
- Security: Validates and logs activities

## Security Features
- Phone number validation
- Suspicious pattern detection
- Business message filtering
- Activity logging
- Local data storage
- No external data sharing

## Performance Features
- Uptime monitoring
- Memory usage tracking
- Command statistics
- Error logging
- Birthday analytics

---
## Dependencies

- `@whiskeysockets/baileys`: WhatsApp Web API client
- `sqlite3`: Database management
- `node-cron`: Scheduled tasks
- `dotenv`: Environment configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

> **Note:** This project is not affiliated with WhatsApp or Meta. Use at your own discretion and in accordance with WhatsApp's terms of service.