import * as chokidar from 'chokidar';
import * as fs from 'fs';
import * as Jimp from 'jimp';
import * as path from 'path';

import { ImageService } from '../data/image.service';
import { randomInt } from '../util';
import { ConvertService } from './convert.service';

const imageFileEndings = ['.bmp', '.jpeg', '.jpg', '.png']; // ['.heic']; // ,

export class LocalImageService extends ImageService {
    private excludeDirs: Array<string>;
    private watcher: chokidar.FSWatcher;

    constructor(dirs: Array<string>, showHidden: boolean, excludeDirs?: Array<string>) {
        super();
        this.excludeDirs = (excludeDirs || []).map(d => path.normalize(d));

        const checkIgnored = (fullpath: string, stats?: fs.Stats): boolean => {
            const pathParts = fullpath.split(path.sep);
            const name = pathParts[pathParts.length - 1];

            if (this.excludeDirs.includes(name) || (!showHidden && name.startsWith('.'))) {
                return true;
            }

            if (!stats || stats.isDirectory()) {
                return false;
            }

            // check endings
            const nameLC = name.toLowerCase();
            const validFileEnding = imageFileEndings.reduce((acc, ending) => acc || nameLC.endsWith(ending.toLocaleLowerCase()), false);
            return !validFileEnding;
        };
        this.watcher = chokidar.watch(dirs, {
            ignorePermissionErrors: true,
            ignored: checkIgnored,
            
        });
    }

    public fetch(): Promise<Jimp> {
        const watched = this.watcher.getWatched();
        const imageFiles: Array<string> = Object.keys(watched).reduce((acc, key) =>
            acc.concat(watched[key].map(filename => path.join(key, filename))), []);
        console.log('Found', imageFiles.length, 'image(s)');
        if (imageFiles.length === 0) {
            return Promise.reject('No images found');
        }
        // pick one
        const image = imageFiles[randomInt(0, imageFiles.length - 1)];
        console.log('Loading local image', image);
        if (ConvertService.needsConverting(image)) {
            return ConvertService.convertFormat('image/heic', fs.readFileSync(image));
        } else {
            return Jimp.read(image);
        }        
    }
}
