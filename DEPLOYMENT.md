# Deployment Guide

This guide explains how to deploy the WhatsApp Birthday Bot both locally and on Render.

## Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/WhatsApp-Birthday-Bot.git
   cd WhatsApp-Birthday-Bot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp env.template .env
   # Edit .env with your configurations
   ```

4. **First-Time Authentication**
   ```bash
   npm run dev
   # Scan the QR code shown in terminal with WhatsApp
   ```

5. **Verify Auth Files**
   - Check that `auth_info_baileys` directory was created
   - This contains your WhatsApp session data

## Production Deployment on Render

### Prerequisites
- A GitHub account
- A private repository (IMPORTANT: Keep your auth files private!)

### Step 1: Prepare Your Repository

1. **Fork the Project**
   - Create a private fork of this repository

2. **Local Authentication**
   - Clone your private fork
   - Run the bot locally first
   - Authenticate with WhatsApp (scan QR code)
   - Verify `auth_info_baileys` directory is created

3. **Commit Auth Files**
   ```bash
   git add auth_info_baileys/
   git commit -m "Add authentication files"
   git push origin main
   ```

### Step 2: Deploy on Render

1. **Create New Web Service**
   - Go to render.com
   - Click "New +"
   - Select "Web Service"
   - Connect your private repository

2. **Configure the Service**
   - Name: `whatsapp-birthday-bot`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables**
   - Add all variables from your `.env` file
   - Set `NODE_ENV=production`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Important Notes

1. **Repository Privacy**
   - NEVER make your repository public
   - Auth files contain sensitive session data
   - Always use a private repository

2. **Environment Variables**
   - Different paths are used for local and production
   - Production uses Render's persistent storage paths
   - Local uses relative paths

3. **Troubleshooting**
   - Check Render logs if bot doesn't connect
   - Verify all environment variables are set
   - Ensure auth files are properly committed

4. **Security**
   - Regularly rotate your session
   - Monitor for unauthorized access
   - Keep your repository private

## Maintenance

1. **Updating the Bot**
   ```bash
   # Local
   git pull origin main
   npm install
   
   # Production
   # Just push changes to your repository
   # Render will automatically redeploy
   ```

2. **Monitoring**
   - Use Render's dashboard for logs
   - Check the health endpoint
   - Monitor WhatsApp connection status

3. **Backup**
   - Regularly backup your auth files
   - Keep a local copy of your configuration

Need help? Open an issue on the repository!
