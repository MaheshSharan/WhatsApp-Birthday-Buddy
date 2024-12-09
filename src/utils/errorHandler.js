const config = require('../config/environment');
const pino = require('pino');
const logger = pino(config.getLoggerConfig());

class ErrorHandler {
    static handle(error, context = '') {
        // Log the error with context
        logger.error({
            error: {
                message: error.message,
                stack: config.isProduction() ? undefined : error.stack,
                code: error.code
            },
            context
        }, 'Error occurred');

        // Handle specific error types
        if (error.message.includes('Authentication files not found')) {
            return {
                type: 'AUTH_ERROR',
                message: 'WhatsApp authentication files not found',
                critical: true,
                action: 'Please follow the deployment guide to set up authentication files'
            };
        }

        if (error.message.includes('Connection closed')) {
            return {
                type: 'CONNECTION_ERROR',
                message: 'WhatsApp connection was closed',
                critical: false,
                action: 'The system will attempt to reconnect automatically'
            };
        }

        if (error.message.includes('Unauthorized')) {
            return {
                type: 'AUTH_ERROR',
                message: 'WhatsApp session is no longer valid',
                critical: true,
                action: 'Re-authentication required. Please check the deployment guide'
            };
        }

        // Default error response
        return {
            type: 'UNKNOWN_ERROR',
            message: config.isProduction() ? 
                'An internal error occurred' : 
                error.message,
            critical: true,
            action: 'Please check the logs for more details'
        };
    }

    static async handleAsync(promise, context = '') {
        try {
            return await promise;
        } catch (error) {
            return this.handle(error, context);
        }
    }

    static isOperationalError(error) {
        // Determine if error is operational (can be handled) or programming error
        if (error.type === 'AUTH_ERROR' || 
            error.type === 'CONNECTION_ERROR') {
            return true;
        }
        return false;
    }

    static formatError(error, includeStack = false) {
        return {
            message: error.message,
            type: error.type || 'UNKNOWN_ERROR',
            stack: includeStack && !config.isProduction() ? error.stack : undefined,
            timestamp: new Date().toISOString()
        };
    }
}

// Global uncaught exception handler
process.on('uncaughtException', (error) => {
    const formattedError = ErrorHandler.handle(error, 'Uncaught Exception');
    logger.fatal(formattedError);
    
    // If it's not an operational error, exit the process
    if (!ErrorHandler.isOperationalError(formattedError)) {
        process.exit(1);
    }
});

// Global unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    const formattedError = ErrorHandler.handle(
        reason instanceof Error ? reason : new Error(String(reason)),
        'Unhandled Rejection'
    );
    logger.fatal(formattedError);
    
    // If it's not an operational error, exit the process
    if (!ErrorHandler.isOperationalError(formattedError)) {
        process.exit(1);
    }
});

module.exports = ErrorHandler;
