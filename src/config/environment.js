const path = require('path');

// Environment-specific configurations
const config = {
    // Auth file path based on environment
    getAuthPath: () => {
        return process.env.NODE_ENV === 'production'
            ? '/opt/render/project/src/auth_info_baileys'
            : path.join(process.cwd(), 'auth_info_baileys');
    },

    // Store file path based on environment
    getStorePath: () => {
        return process.env.NODE_ENV === 'production'
            ? '/opt/render/project/src/baileys_store.json'
            : path.join(process.cwd(), 'baileys_store.json');
    },

    // Logger configuration based on environment
    getLoggerConfig: () => ({
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        transport: process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                    colorize: true
                }
            }
    }),

    // Check if running in production
    isProduction: () => process.env.NODE_ENV === 'production',

    // Get environment-specific connection config
    getConnectionConfig: () => ({
        connectTimeoutMs: process.env.NODE_ENV === 'production' ? 60000 : 30000,
        qrTimeout: process.env.NODE_ENV === 'production' ? 60000 : 30000,
        maxReconnectAttempts: process.env.NODE_ENV === 'production' ? 10 : 5,
        printQRInTerminal: !process.env.NODE_ENV === 'production'
    })
};

module.exports = config;
