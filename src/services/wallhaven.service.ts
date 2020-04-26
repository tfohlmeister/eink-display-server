import * as Jimp from 'jimp';
import * as wallhaven from 'wallhaven.js';

import { ImageService } from '../data/image.service';
import { WallhavenSearchResult, WallhavenWallpaperResult } from '../data/wallhaven';


export class WallhavenImageService extends ImageService {

    constructor() {
        super();
    }
    
    public fetch(): Promise<Jimp> {
        return wallhaven().search({sorting:'random', order:'desc'})
            .then((wallpapers: WallhavenSearchResult) => {
                const firstId = wallpapers.data[0].id;
                console.log('Loading Wallhaven Image',firstId);
                return wallhaven().wallpaper(firstId);
            })
            .then((wallpaper: WallhavenWallpaperResult) => {
                return Jimp.read(wallpaper.data.path);
            });
    }
}

