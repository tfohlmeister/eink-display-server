"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const options = {
    host: 'localhost',
    port: 3000,
    timeout: 2000,
    method: 'GET',
    path: '/health',
};
const req = http_1.request(options, (result) => {
    console.info(`Performed health check, result ${result.statusCode}`);
    if (result.statusCode === 200) {
        process.exit(0);
    }
    else {
        process.exit(1);
    }
});
req.on('error', (err) => {
    console.error(`An error occurred while performing health check, error: ${err}`);
    process.exit(1);
});
req.end();
