import * as express from 'express';
import { ImageService } from './data/image.service';
import { ConvertService } from './services/convert.service';
import { LocalImageService } from './services/local.service';
import { WallhavenImageService } from './services/wallhaven.service';


const PORT = 3000;
const LOCAL_FOLDERS = process.env.LOCAL_FOLDERS ? (process.env.LOCAL_FOLDERS || '').split(',') : ['/images'];
const LOCAL_EXCLUDE = (process.env.LOCAL_EXCLUDE || '').split(',');
const LOCAL_SHOW_HIDDEN = Boolean(process.env.LOCAL_SHOW_HIDDEN) || false;
const EINK_WIDTH = Number(process.env.EINK_WIDTH) || 800;
const EINK_HEIGHT = Number(process.env.EINK_HEIGHT) || 480;

const app = express();

// route definitions
const routes: {[key in string]: ImageService} = {
    '/wallpaper.bmp': new WallhavenImageService(),
    '/local.bmp': new LocalImageService(LOCAL_FOLDERS, LOCAL_SHOW_HIDDEN, LOCAL_EXCLUDE)
};

const handleService = (service: ImageService, req, res) => {
    service.fetch()
    .then(image => ConvertService.convertForEInk(image, EINK_WIDTH, EINK_HEIGHT))
    .then(buffer => {
        res.status(200);
        res.contentType('image/bmp');
        res.send(buffer);
        res.end();
    })
    .catch(error => {
        res.status(500).json({error});
    });
};

// setup routes
Object.keys(routes).map(route => {
    app.get(route, (req, res) => {
        const service = routes[route];
        handleService(service, req, res);
    });
});

app.get('/health', (req, res) => {
    res.json({status: 'healthy'});
});
  
app.listen(PORT, '0.0.0.0' , () => {
    console.log(`Server is listening on port ${PORT}`);
});