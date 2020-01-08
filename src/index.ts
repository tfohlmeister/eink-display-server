import * as express from 'express';
import * as request from 'request';
import * as sharp from 'sharp';

const wallhaven = require('wallhaven.js')(); 


const PORT = process.env.PORT || 3000;
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


app.get('/', function (req, res) {
    return wallhaven.search({sorting:'random', order:'desc'}).then((wallpapers: WallhavenSearchResult) => {
        const firstId = wallpapers.data[0].id;
        console.log('Loading',firstId);
        return wallhaven.wallpaper(firstId);
    }).then((wallpaper: WallhavenWallpaperResult) => {
        request.get(wallpaper.data.path)
            .pipe(
                sharp()
                .resize(800, 480)
                .grayscale(true)
                .toFormat(sharp.format.png)
            )
            .pipe(res); 
    }).catch(error => {
        res.status(500).end();
    })
});

  
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});