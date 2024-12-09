const express = require('express');
const whatsapp = require('../whatsapp/connection');
const config = require('../config/environment');
const fs = require('fs');
const path = require('path');

function createHealthCheckServer() {
    const app = express();

    app.get('/health', async (req, res) => {
        try {
            const status = whatsapp.getStatus();
            const authPath = config.getAuthPath();
            const storePath = config.getStorePath();

            // Check various components
            const health = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                whatsapp: {
                    connected: status.authenticated,
                    status: status.connectionStatus,
                    reconnectAttempts: status.reconnectAttempts
                },
                system: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    node: process.version
                },
                files: {
                    auth: {
                        exists: fs.existsSync(authPath),
                        path: config.isProduction() ? 'REDACTED' : authPath
                    },
                    store: {
                        exists: fs.existsSync(storePath),
                        path: config.isProduction() ? 'REDACTED' : storePath
                    }
                }
            };

            // Determine overall health status
            if (!health.whatsapp.connected) {
                health.status = 'degraded';
            }
            if (!health.files.auth.exists || !health.files.store.exists) {
                health.status = 'critical';
            }

            // Add environment-specific checks
            if (config.isProduction()) {
                // In production, check if auth files exist
                if (!fs.existsSync(authPath)) {
                    health.status = 'critical';
                    health.error = 'Authentication files missing in production';
                }
            }

            // Set response status code based on health status
            const statusCode = health.status === 'ok' ? 200 : 
                             health.status === 'degraded' ? 200 : 500;

            res.status(statusCode).json(health);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                timestamp: new Date().toISOString(),
                error: config.isProduction() ? 'Internal server error' : error.message
            });
        }
    });

    return app;
}

function startHealthCheck(port = 3000) {
    const app = createHealthCheckServer();
    const healthPort = process.env.HEALTH_CHECK_PORT || port;

    app.listen(healthPort, () => {
        console.log(`Health check server running on port ${healthPort}`);
        console.log(`Health endpoint: http://localhost:${healthPort}/health`);
    });
}

module.exports = {
    startHealthCheck,
    createHealthCheckServer
};
