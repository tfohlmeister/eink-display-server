"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const convert_service_1 = require("./services/convert.service");
const local_service_1 = require("./services/local.service");
const wallhaven_service_1 = require("./services/wallhaven.service");
const PORT = 3000;
const LOCAL_FOLDERS = process.env.LOCAL_FOLDERS ? (process.env.LOCAL_FOLDERS || '').split(',') : ['/images'];
const LOCAL_EXCLUDE = (process.env.LOCAL_EXCLUDE || '').split(',');
const LOCAL_SHOW_HIDDEN = Boolean(process.env.LOCAL_SHOW_HIDDEN) || false;
const EINK_WIDTH = Number(process.env.EINK_WIDTH) || 800;
const EINK_HEIGHT = Number(process.env.EINK_HEIGHT) || 480;
const app = express();
// route definitions
const imageRoutes = {
    '/wallpaper.bmp': new wallhaven_service_1.WallhavenImageService(),
    '/local.bmp': new local_service_1.LocalImageService(LOCAL_FOLDERS, LOCAL_SHOW_HIDDEN, LOCAL_EXCLUDE)
};
const handleService = (service, req, res) => {
    service.fetch()
        .then(image => convert_service_1.ConvertService.convertForEInk(image, EINK_WIDTH, EINK_HEIGHT))
        .then(buffer => {
        res.status(200);
        res.contentType('image/bmp');
        res.send(buffer);
        res.end();
    })
        .catch(error => {
        res.status(500).json({ error });
    });
};
// setup routes
Object.keys(imageRoutes).map(route => {
    app.get(route, (req, res) => {
        const service = imageRoutes[route];
        handleService(service, req, res);
    });
});
app.get('/', (req, res) => {
    res.json({
        routes: Object.keys(imageRoutes)
    });
});
app.get('*', (req, res) => {
    res.redirect('/');
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is listening on port ${PORT}`);
});
