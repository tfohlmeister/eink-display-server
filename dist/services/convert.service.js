"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const floydSteinberg = require("floyd-steinberg");
const heicDecoder = require("heic-decode");
const Jimp = require("jimp");
class ConvertService {
    static convertForEInk(image, w, h) {
        const cropped = image.cover(w, h);
        cropped.bitmap = floydSteinberg(cropped.bitmap);
        return cropped.getBufferAsync('image/bmp');
    }
    static needsConverting(filename) {
        const name = filename.toLocaleLowerCase();
        return this.needsConvertingEndings.reduce((acc, cur) => acc || name.endsWith(cur.toLocaleLowerCase()), false);
    }
    static convertFormat(fromMime, fromBuffer) {
        try {
            switch (fromMime) {
                case 'image/heic':
                    return heicDecoder({ buffer: fromBuffer })
                        .then(res => new Promise((resolve, reject) => {
                        const jimp = new Jimp(res.width, res.height, err => {
                            if (err) {
                                return reject(err);
                            }
                            jimp.bitmap.data = new Buffer(res.data);
                            resolve(jimp);
                        });
                    }));
                default:
                    return Promise.reject(`No conversion found for ${fromMime}.`);
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}
exports.ConvertService = ConvertService;
ConvertService.needsConvertingEndings = ['.heic'];
