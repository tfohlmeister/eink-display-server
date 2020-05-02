"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Jimp = require("jimp");
const wallhaven = require("wallhaven.js");
const image_service_1 = require("../data/image.service");
class WallhavenImageService extends image_service_1.ImageService {
    constructor() {
        super();
    }
    fetch() {
        return wallhaven().search({ sorting: 'random', order: 'desc' })
            .then((wallpapers) => {
            const firstId = wallpapers.data[0].id;
            console.log('Loading Wallhaven Image', firstId);
            return wallhaven().wallpaper(firstId);
        })
            .then((wallpaper) => {
            return Jimp.read(wallpaper.data.path);
        });
    }
}
exports.WallhavenImageService = WallhavenImageService;
