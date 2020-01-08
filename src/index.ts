import * as express from 'express';
import * as floydSteinberg from 'floyd-steinberg';
import * as jimp from 'jimp';

const wallhaven = require('wallhaven.js')(); 


const PORT = 3000;
const app = express();

interface WallhavenSearchResult {
    data: [{
        id: string;
        url: string;
        dimension_x: number;
        dimension_y: number;
    }]
}

interface WallhavenWallpaperResult {
    data: {
        id: string;
        path: string;
    }
}


app.get('/', function (req, res, next) {
    wallhaven.search({sorting:'random', order:'desc'}).then((wallpapers: WallhavenSearchResult) => {
        const firstId = wallpapers.data[0].id;
        console.log('Loading',firstId);
        return wallhaven.wallpaper(firstId);
    })
    .then((wallpaper: WallhavenWallpaperResult) => {
        return jimp
            .read(wallpaper.data.path)
            .then(res => res
                .cover(800, 480)
            ).then(jimp => {
                jimp.bitmap = floydSteinberg(jimp.bitmap);
                return jimp.getBufferAsync('image/bmp');
            })
    })
    .then(buffer => res.send(buffer))
    .catch(error => {
        next(error);
    });
});

  
app.listen(PORT, '0.0.0.0' , () => {
    console.log(`Server is listening on port ${PORT}`);
});