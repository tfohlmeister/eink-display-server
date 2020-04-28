import * as floydSteinberg from 'floyd-steinberg';
import * as heicDecoder from 'heic-decode';
import * as Jimp from 'jimp';

export class ConvertService {
    public static readonly needsConvertingEndings = ['.heic'];

    public static convertForEInk(image: Jimp): Promise<Buffer> {
        const cropped = image.cover(800, 480);
        cropped.bitmap = floydSteinberg(cropped.bitmap);
        return cropped.getBufferAsync('image/bmp');
    }

    public static needsConverting(filename: string): boolean {
        const name = filename.toLocaleLowerCase();
        return this.needsConvertingEndings.reduce((acc, cur) => acc || name.endsWith(cur.toLocaleLowerCase()), false);
    }

    public static convertFormat(fromMime: string, fromBuffer: Buffer): Promise<Jimp> {
        try {
            switch (fromMime) {
                case 'image/heic':
                    return (heicDecoder({ buffer: fromBuffer }) as Promise<{data: Buffer; width: number; height: number}>)
                        .then(res =>
                            new Promise((resolve, reject) => {
                                const jimp = new Jimp(res.width, res.height, err => {
                                    if (err) {
                                        return reject(err);
                                    }
                                    jimp.bitmap.data = new Buffer(res.data);
                                    resolve(jimp);
                                });
                            })
                        );
                default:
                    return Promise.reject(`No conversion found for ${fromMime}.`);
            }
        } catch(error) {
            return Promise.reject(error);
        }
    }
}