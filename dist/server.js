"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const convert_service_1 = require("./services/convert.service");
const local_service_1 = require("./services/local.service");
const wallhaven_service_1 = require("./services/wallhaven.service");
const PORT = Number(process.env.PORT) || 3000;
const LOCAL_FOLDERS = process.env.LOCAL_FOLDERS ? (process.env.LOCAL_FOLDERS || '').split(',') : ['/images'];
const LOCAL_EXCLUDE = (process.env.LOCAL_EXCLUDE || '').split(',');
const LOCAL_SHOW_HIDDEN = Boolean(process.env.LOCAL_SHOW_HIDDEN) || false;
const EINK_WIDTH = Number(process.env.EINK_WIDTH) || 800;
const EINK_HEIGHT = Number(process.env.EINK_WIDTH) || 480;
const app = express();
// route definitions
const routes = {
    '/wallpaper.bmp': new wallhaven_service_1.WallhavenImageService(),
    '/local.bmp': new local_service_1.LocalImageService(LOCAL_FOLDERS, LOCAL_SHOW_HIDDEN, LOCAL_EXCLUDE)
};
// setup routes
Object.keys(routes).map(route => {
    app.get(route, (req, res, next) => {
        const service = routes[route];
        service.fetch()
            .then(image => convert_service_1.ConvertService.convertForEInk(image, EINK_WIDTH, EINK_HEIGHT))
            .then(buffer => {
            res.contentType('image/bmp');
            res.send(buffer);
            next();
        })
            .catch(error => {
            res.json({ error });
            next();
        });
    });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is listening on port ${PORT}`);
});
