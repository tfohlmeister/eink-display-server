import * as Jimp from 'jimp';


export abstract class ImageService {
    private preFetch: boolean;

    constructor(preFetch = true) {
        this.preFetch = preFetch;
    }

    public abstract fetch(): Promise<Jimp>;
}