import * as chokidar from 'chokidar';
import * as fs from 'fs';
import * as Jimp from 'jimp';
import * as path from 'path';
import { ImageService } from '../data/image.service';
import { randomInt } from '../util';
import { ConvertService } from './convert.service';


const imageFileEndings = ['.heic', '.bmp', '.jpeg', '.jpg', '.png'];

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

    private isValidFileending(filename: string): boolean {
        const name = filename.toLowerCase();
        return imageFileEndings.reduce((acc, ending) => acc || name.endsWith(ending.toLocaleLowerCase()), false);
    }

    public fetch(): Promise<Jimp> {
        const watched = this.watcher.getWatched();
        const imageFiles: Array<string> = Object.keys(watched).reduce((acc, key) => {
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
        const image = imageFiles[randomInt(0, imageFiles.length - 1)];
        console.log('Loading local image', image);
        if (ConvertService.needsConverting(image)) {
            return ConvertService.convertFormat('image/heic', fs.readFileSync(image));
        } else {
            return Jimp.read(image);
        }        
    }
}
