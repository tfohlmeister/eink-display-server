import * as express from "express";
import { ImageService } from "./data/image.service";
import { ConvertService } from "./services/convert.service";
import { LocalImageService } from "./services/local.service";

const PORT = 3000;
const LOCAL_FOLDERS = process.env.LOCAL_FOLDERS ? (process.env.LOCAL_FOLDERS || "").split(",") : ["/images"];
const LOCAL_EXCLUDE = (process.env.LOCAL_EXCLUDE || "").split(",");
const LOCAL_SHOW_HIDDEN = Boolean(process.env.LOCAL_SHOW_HIDDEN) || false;
const EINK_WIDTH = Number(process.env.EINK_WIDTH) || 800;
const EINK_HEIGHT = Number(process.env.EINK_HEIGHT) || 480;

const app = express();

const localService = new LocalImageService(LOCAL_FOLDERS, LOCAL_SHOW_HIDDEN, LOCAL_EXCLUDE);

// route definitions
const imageRoutes: { [key in string]: ImageService } = {
  "/local.bmp": localService,
};

const handleService = async (service: ImageService, req: express.Request, res: express.Response) => {
  try {
    const targetFormat = req.url.endsWith(".bmp") ? "bmp" : "png";
    const image = await service.fetch();
    const convertedBuffer = await ConvertService.convertForEInk(image, EINK_WIDTH, EINK_HEIGHT, targetFormat);

    res.status(200);
    res.contentType(`image/${targetFormat}`);
    res.send(convertedBuffer);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

// setup routes
Object.keys(imageRoutes).map((route) => {
  app.get(route, (req, res) => {
    const service = imageRoutes[route];
    handleService(service, req, res);
  });
});

app.get("/", (req, res) => {
  res.json({
    routes: Object.keys(imageRoutes),
  });
});

app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening on port ${PORT}`);
});
