import * as Jimp from "jimp";

export abstract class ImageService {
  protected preFetch: boolean;

  constructor(preFetch = true) {
    this.preFetch = preFetch;
  }

  public abstract fetch(): Promise<Jimp>;
}
