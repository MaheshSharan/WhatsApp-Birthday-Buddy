const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const config = require('../config/environment');
const logger = pino(config.getLoggerConfig());
const messageHandler = require('./messageHandler');
const commandHandler = require('../handlers/commandHandler');

// Create store to handle message history
const store = makeInMemoryStore({ logger });
store.readFromFile(config.getStorePath());
setInterval(() => {
    store.writeToFile(config.getStorePath());
}, 10000);

class WhatsAppConnection {
    constructor() {
        this.sock = null;
        this.qr = null;
        this.authenticated = false;
        this.messageHandlers = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = config.getConnectionConfig().maxReconnectAttempts;
        this.connectionStatus = 'disconnected';
    }

    // Get current connection status
    getStatus() {
        return {
            authenticated: this.authenticated,
            connectionStatus: this.connectionStatus,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    // Initialize connection with error handling
    async connect() {
        try {
            const authPath = config.getAuthPath();
            
            // Check if auth directory exists in production
            if (config.isProduction() && !fs.existsSync(authPath)) {
                throw new Error('Authentication files not found. Please follow the deployment guide to set up authentication files.');
            }

            const { state, saveCreds } = await useMultiFileAuthState(authPath);
            const { version } = await fetchLatestBaileysVersion();

            // Connection configuration
            const connectionConfig = config.getConnectionConfig();
            this.sock = makeWASocket({
                version,
                logger,
                printQRInTerminal: connectionConfig.printQRInTerminal,
                auth: state,
                browser: ["Chrome (Linux)", "", ""],
                connectTimeoutMs: connectionConfig.connectTimeoutMs,
                qrTimeout: connectionConfig.qrTimeout,
                defaultQueryTimeoutMs: 60000,
                keepAliveIntervalMs: 10000,
                emitOwnEvents: true,
            });

            store.bind(this.sock.ev);

            // Handle connection events with improved error handling
            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.qr = qr;
                    this.authenticated = false;
                    this.connectionStatus = 'awaiting_qr_scan';
                    
                    if (config.isProduction()) {
                        logger.warn('QR Code requested in production. This should not happen if auth files are properly set up.');
                    } else {
                        console.log('\n=========================');
                        console.log('Please scan the QR code with WhatsApp:');
                        console.log('1. Open WhatsApp > Settings > Linked Devices');
                        console.log('2. Tap on "Link a Device"');
                        console.log('3. Scan the QR code');
                        console.log('=========================\n');
                    }
                }

                if (connection === 'close') {
                    this.authenticated = false;
                    this.connectionStatus = 'disconnected';
                    
                    const statusCode = (lastDisconnect?.error instanceof Boom)?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    
                    logger.error({
                        error: lastDisconnect?.error,
                        statusCode,
                        reconnectAttempt: this.reconnectAttempts + 1
                    }, 'Connection closed');

                    if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        logger.info(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                        setTimeout(async () => {
                            await this.connect();
                        }, Math.min(1000 * this.reconnectAttempts, 10000)); // Exponential backoff with max 10s
                    } else if (statusCode === DisconnectReason.loggedOut) {
                        logger.error('WhatsApp session logged out. New authentication required.');
                        if (config.isProduction()) {
                            logger.error('Session logged out in production. Manual intervention required.');
                            // You might want to implement notification system here
                        }
                        process.exit(1);
                    }
                }

                if (connection === 'open') {
                    this.authenticated = true;
                    this.connectionStatus = 'connected';
                    this.qr = null;
                    this.reconnectAttempts = 0;
                    logger.info('Successfully connected to WhatsApp');

                    // Send startup notification
                    try {
                        const userPhoneNumber = this.sock.user.id.split(':')[0];
                        await this.sock.sendMessage(`${userPhoneNumber}@s.whatsapp.net`, {
                            text: `🤖 Bot ${config.isProduction() ? 'Production' : 'Development'} is now connected and ready!`
                        });
                    } catch (error) {
                        logger.error('Failed to send startup notification:', error);
                    }
                }
            });

            // Handle credentials update
            this.sock.ev.on('creds.update', saveCreds);

            // Handle messages with error handling
            this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type === 'notify') {
                    for (const message of messages) {
                        try {
                            await messageHandler.handleMessage(message);
                            await commandHandler.handleMessage(message);
                        } catch (error) {
                            logger.error({ messageId: message.key.id, error }, 'Error processing message');
                        }
                    }
                }
            });

        } catch (error) {
            this.connectionStatus = 'error';
            logger.error({ error }, 'Failed to initialize WhatsApp connection');
            
            if (error.message.includes('Authentication files not found') && config.isProduction()) {
                logger.error('Missing authentication files in production environment');
                process.exit(1);
            }

            throw error;
        }
    }

    // Add message handler
    addMessageHandler(handler) {
        this.messageHandlers.add(handler);
    }

    // Remove message handler
    removeMessageHandler(handler) {
        this.messageHandlers.delete(handler);
    }

    // Send text message
    async sendTextMessage(to, text) {
        if (!this.sock || !this.authenticated) {
            throw new Error('WhatsApp is not connected');
        }
        try {
            await this.sock.sendMessage(to, { text });
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }
}

// Export singleton instance
const whatsapp = new WhatsAppConnection();
module.exports = whatsapp;
