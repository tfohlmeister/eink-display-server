import * as heicDecoder from 'heic-decode';
import * as Jimp from 'jimp';

export interface Bitmap {
    data: Buffer;
    width: number;
    height: number;
}

export class ConvertService {
    public static readonly needsConvertingEndings = ['.heic'];

    public static convertForEInk(image: Jimp, w: number, h: number): Promise<Buffer> {
        const cropped = image.cover(w, h);
        cropped.bitmap = this.floydSteinberg(cropped.bitmap);

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
                    return (heicDecoder({ buffer: fromBuffer }) as Promise<Bitmap>)
                        .then(res =>
                            new Promise((resolve, reject) => {
                                const jimp = new Jimp(res.width, res.height, err => {
                                    if (err) {
                                        return reject(err);
                                    }
                                    jimp.bitmap.data = Buffer.from(res.data);
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

    private static floydSteinberg(image: Bitmap): Bitmap {
        /* Based on https://github.com/noopkat/floyd-steinberg/blob/master/floyd-steinberg.js */
        
        const imageData = image.data;
        const imageDataLength = imageData.length;
        const w = image.width;
        const h = image.height;
        const lumR = [],
            lumG = [],
            lumB = [];
        
        let newPixel: number, err: number, xpos: number, ypos: number;
        const saveUpdateImageData = (position: number, valueToAdd: number) => {
            imageData[position] = Math.min(255, Math.max(0, imageData[position] + valueToAdd));
        };
        
        for (let i = 0; i < 256; i++) {
            lumR[i] = i * 0.299;
            lumG[i] = i * 0.587;
            lumB[i] = i * 0.110;
        }
        
        // Greyscale luminance (sets r pixels to luminance of rgb)
        for (let i = 0; i <= imageDataLength; i += 4) {
            imageData[i] = Math.floor(lumR[imageData[i]] + lumG[imageData[i+1]] + lumB[imageData[i+2]]);
        }
        
        for (let currentPixel = 0; currentPixel <= imageDataLength; currentPixel += 4) {
            // threshold for determining current pixel's conversion to a black or white pixel
            newPixel = imageData[currentPixel] < 129 ? 0 : 255;
            err = Math.floor((imageData[currentPixel] - newPixel) / 16);
            xpos = (currentPixel / 4) % w;
            ypos = Math.floor((currentPixel / 4) / w);
            imageData[currentPixel] = newPixel;

            if (xpos < w-1)
                saveUpdateImageData(currentPixel + 4, err * 7); // pixel to the right
            if (xpos > 0 && ypos < h-1)
                saveUpdateImageData(currentPixel + 4 * w - 4, err * 3); // pixel to the bottom left
            if (ypos < h-1)
                saveUpdateImageData(currentPixel + 4 * w - 0, err * 5); // pixel below
            if (ypos < h-1 && xpos < w-1)
                saveUpdateImageData(currentPixel + 4 * w + 4, err * 1); // pixel to the bottom right

            // Set g and b values equal to r (effectively greyscales the image fully)
            imageData[currentPixel + 1] = imageData[currentPixel + 2] = imageData[currentPixel];
        }
        
        return image;
    }
}