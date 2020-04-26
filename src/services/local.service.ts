import * as fs from 'fs';
import * as Jimp from 'jimp';
import * as path from 'path';

import { ImageService } from '../data/image.service';
import { randomInt } from '../util';
import { ConvertService } from './convert.service';

const imageFileEndings = ['.heic']; // , '.bmp', '.jpeg', '.jpg', '.png'];

export class LocalImageService extends ImageService {
    private excludeDirs: Array<string>;
    private rootDir: string;
    private imageFiles: Array<string> = [];
    private showHidden: boolean;

    constructor(dir: string, showHidden: boolean, excludeDirs?: Array<string>) {
        super();
        this.excludeDirs = (excludeDirs || []).map(d => path.normalize(d));
        this.rootDir = dir;
        this.showHidden = showHidden;
        this.setupWatcher();

        setTimeout(() => {
            this.loadImages();
        });
    }

    public fetch(): Promise<Jimp> {
        if (this.imageFiles.length === 0) {
            return Promise.reject('No images found');
        }
        // pick one
        const image = this.imageFiles[randomInt(0, this.imageFiles.length - 1)];
        console.log('Loading local image', image);
        if (ConvertService.needsConverting(image)) {
            return ConvertService.convertFormat('image/heic', fs.readFileSync(image));
        } else {
            return Jimp.read(image);
        }        
    }

    private loadImages() {
        // get list of files in directory
        const allFiles = this.listFiles();
        

        // filter for image files only
        const imageFiles = allFiles.filter(file => imageFileEndings.reduce((acc, ending) => acc || file.toLocaleLowerCase().endsWith(ending.toLocaleLowerCase()), false));
        console.log('Found', imageFiles.length, 'local image(s).');
        this.imageFiles = imageFiles;
    }

    private setupWatcher() {
        console.log('TODO');
    }

    private listFiles(dir = this.rootDir): Array<string> {
        return fs.readdirSync(dir).reduce((list, file) => {
            const fullPath = path.join(dir, file);

            const pathParts = fullPath.split(path.sep);
            const name = pathParts[pathParts.length - 1];

            // skip if hidden and showHidden is false
            if (!this.showHidden && name.startsWith('.')) {
                return list;
            }

            if (fs.statSync(fullPath).isDirectory()) {   
                if (this.excludeDirs.includes(name)) {
                    console.log('Found sub-dir', fullPath, 'but is on exclude list. Skipping.');
                    return list;
                }
                console.log('Found sub-dir', fullPath);
                return list.concat(this.listFiles(fullPath));
            }
            return list.concat([fullPath]);
        }, []);
    }
}
