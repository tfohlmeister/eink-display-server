import * as express from 'express';

import { ImageService } from './data/image.service';
import { ConvertService } from './services/convert.service';
import { LocalImageService } from './services/local.service';
import { WallhavenImageService } from './services/wallhaven.service';

const PORT = Number(process.env.PORT) || 3000;
const LOCAL_FOLDER = process.env.LOCAL_FOLDER || '/images';
const LOCAL_EXCLUDE = (process.env.LOCAL_EXCLUDE || '').split(',');
const LOCAL_SHOW_HIDDEN = Boolean(process.env.LOCAL_SHOW_HIDDEN) || false;

const app = express();

// init services
const routes: {[key in string]: ImageService} = {
    '/wallpaper.bmp': new WallhavenImageService(),
    '/local.bmp': new LocalImageService(LOCAL_FOLDER, LOCAL_SHOW_HIDDEN, LOCAL_EXCLUDE)
};

Object.keys(routes).map(route => {
    app.get(route, (req, res, next) => {
        const service = routes[route];
        service.fetch()
            .then(image => ConvertService.convertForEInk(image))
            .then(buffer => {
                res.send(buffer);
                next();
            })
            .catch(error => {
                next(error);
            });
        });
});
  
app.listen(PORT, '0.0.0.0' , () => {
    console.log(`Server is listening on port ${PORT}`);
});