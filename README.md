# eInk Display Server

A small NodeJS based server to serve local or public images optimized for common eInk Displays (e.g. from Waveshare).

Images are converted to BMP and translated into black and white "grayscale" using [Floyd Steinberg dithering](https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering).

Support for Docker is available and the recommended way of deploying.

## Supported services / sources
Currently two services have been implemented:

#### 1. Local files
This service picks a random picture from a local folder (including subfolders). Supported image types are: `bmp`, `jpeg`, `png`, `tiff` and `heic`.

Endpoint: `/local.bmp`

#### 2. Wallhaven Wallpapers
This service downloads a [random desktop wallpaper from Wallhaven.cc](https://wallhaven.cc/random) and converts it.

Endpoint: `/wallpaper.bmp`


# Usage (Docker)

## Configuration

Configuration is done using environmental variables, all of which are optional and have reasonable defaults. You probably want to adapt *EINK_WIDTH* and *EINK_HEIGHT* to match your specific display. The following options are available:

| Environmental Variable    | Required  | Default   | Description   |
| ---                       | ---       | ---       | ---           |
| *EINK_WIDTH* | *false* | 800 | Display width in pixels. Used to scale the original image up or down to this width. |
| *EINK_HEIGHT* | *false* | 480 | Display height in pixels. Used to scale the original image up or down to this height. |
| *PORT* | *false* | 3000 | Server port to listen on |
| *LOCAL_FOLDERS* | *false* | `/images` | Comma separated list of folders to include in local image list |
| *LOCAL_EXCLUDE* | *false* | *empty* | Comma separated list of (sub-)folder names to be excluded from *LOCAL_FOLDERS* |
| *LOCAL_SHOW_HIDDEN* | *false* | *false* | Wether to use hidden files (=starting with a dot) in *LOCAL_FOLDERS*. |

## Run Docker container

Simple run with defaults:

    docker run -d \
        --name eInkServer \
        tfohlmeister/eink-display-server:latest


### Advanced examples
With mounted local image folders:

    docker run -d \
        --name eInkServer \
        -p 3000:3000
        -v /path/to/local/images:/images \
        tfohlmeister/eink-display-server:latest


With two mounted image folders and defined excludes

    docker run -d \
        --name eInkServer \
        -v /path/to/local/images1:/images/images1 \
        -v /path/to/local/images2:/images/images2 \
        -e LOCAL_FOLDERS=/images/images1,/images/images2 \
        -e LOCAL_EXCLUDE=PrivatePictures \
        tfohlmeister/eink-display-server:latest


# Development


### 1. Install dependencies

    npm install

### 2. Develop with auto-compiling and debugging enabled

    npm run watch-debug

### 3. Build server and container

    npm run build
    docker build --tag eink-display-server:latest .