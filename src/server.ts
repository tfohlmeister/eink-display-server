import * as express from 'express';

import { ImageService } from './data/image.service';
import { ConvertService } from './services/convert.service';
import { LocalImageService } from './services/local.service';
import { WallhavenImageService } from './services/wallhaven.service';

const PORT = Number(process.env.PORT) || 3000;
const LOCAL_FOLDERS = process.env.LOCAL_FOLDERS ? (process.env.LOCAL_FOLDERS || '').split(',') : ['/images'];
const LOCAL_EXCLUDE = (process.env.LOCAL_EXCLUDE || '').split(',');
const LOCAL_SHOW_HIDDEN = Boolean(process.env.LOCAL_SHOW_HIDDEN) || false;
const EINK_WIDTH = Number(process.env.EINK_WIDTH) || 800;
const EINK_HEIGHT = Number(process.env.EINK_WIDTH) || 480;

const app = express();

// route definitions
const routes: {[key in string]: ImageService} = {
    '/wallpaper.bmp': new WallhavenImageService(),
    '/local.bmp': new LocalImageService(LOCAL_FOLDERS, LOCAL_SHOW_HIDDEN, LOCAL_EXCLUDE)
};

// setup routes
Object.keys(routes).map(route => {
    app.get(route, (req, res, next) => {
        const service = routes[route];
        service.fetch()
            .then(image => ConvertService.convertForEInk(image, EINK_WIDTH, EINK_HEIGHT))
            .then(buffer => {
                res.contentType('image/bmp');
                res.send(buffer);
                next();
            })
            .catch(error => {
                res.json({error});
                next();
            });
        });
});
  
app.listen(PORT, '0.0.0.0' , () => {
    console.log(`Server is listening on port ${PORT}`);
});