"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalImageService = void 0;
const chokidar = require("chokidar");
const fs = require("fs");
const Jimp = require("jimp");
const path = require("path");
const image_service_1 = require("../data/image.service");
const util_1 = require("../util");
const convert_service_1 = require("./convert.service");
const imageFileEndings = ['.heic', '.bmp', '.jpeg', '.jpg', '.png'];
class LocalImageService extends image_service_1.ImageService {
    constructor(dirs, showHidden, excludeDirs) {
        super();
        this.excludeDirs = (excludeDirs || []).map(d => path.normalize(d));
        const checkIgnored = (fullpath, stats) => {
            const pathParts = fullpath.split(path.sep);
            const name = pathParts[pathParts.length - 1];
            if (this.excludeDirs.includes(name) || (!showHidden && name.startsWith('.'))) {
                return true;
            }
            if (!stats || stats.isDirectory()) {
                return false;
            }
            // check endings
            return !this.isValidFileending(name);
        };
        this.watcher = chokidar.watch(dirs, {
            ignorePermissionErrors: false,
            ignored: checkIgnored,
        });
        this.watcher
            .on('error', error => console.error(`Watcher error: ${error}`))
            .on('ready', () => console.log('Initial scan complete.'));
    }
    isValidFileending(filename) {
        const name = filename.toLowerCase();
        return imageFileEndings.reduce((acc, ending) => acc || name.endsWith(ending.toLocaleLowerCase()), false);
    }
    fetch() {
        const watched = this.watcher.getWatched();
        const imageFiles = Object.keys(watched).reduce((acc, key) => {
            const fullpaths = watched[key]
                .map(filename => this.isValidFileending(filename) ? path.join(key, filename) : null)
                .filter(item => !!item);
            return acc.concat(fullpaths);
        }, []);
        console.log('Found', imageFiles.length, 'image(s)');
        if (imageFiles.length === 0) {
            return Promise.reject('No images found');
        }
        // pick one
        const image = imageFiles[util_1.randomInt(0, imageFiles.length - 1)];
        console.log('Loading local image', image);
        if (convert_service_1.ConvertService.needsConverting(image)) {
            return convert_service_1.ConvertService.convertFormat('image/heic', fs.readFileSync(image));
        }
        else {
            return Jimp.read(image);
        }
    }
}
exports.LocalImageService = LocalImageService;
