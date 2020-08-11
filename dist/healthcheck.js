"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
node_fetch_1.default('http://localhost:3000/')
    .then(result => {
    console.info(`Performed health check, result ${result.status}.`);
    if (result.status === 200) {
        process.exit(0);
    }
    else {
        process.exit(1);
    }
})
    .catch(err => {
    console.error(`An error occurred while performing health check, error: ${err}`);
    process.exit(1);
});
