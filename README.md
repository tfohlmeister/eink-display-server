# eInk Display Server

A small NodeJS based server to serve local or public images optimized for common eInk Displays (e.g. from Waveshare) in combination with a WiFi-enabled microcontroller (e.g. esp32, esp8266).

**Important:** _This is only the server part. You will need to program your microcontroller yourself so it fetches images from this server using TCP/IP._

Images are converted to BMP and translated into black and white "grayscale" using [Floyd Steinberg dithering](https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering).

Support for Docker is available and the recommended way of deploying.

## Supported services / sources

#### 1. Local files

This service picks a random picture from a local folder (including subfolders). Supported image types are: `bmp`, `jpeg`, `png`, `tiff` and `heic`.

Endpoint: `/local.bmp` or `/local.png`

# Usage (Docker)

## Configuration

The server listens on port 3000 and individual configuration is done using environmental variables, all of which are optional and have reasonable defaults. You probably want to adapt _EINK_WIDTH_ and _EINK_HEIGHT_ to match your specific display. The following options are available:

| Environmental Variable | Required | Default   | Description                                                                           |
| ---------------------- | -------- | --------- | ------------------------------------------------------------------------------------- |
| _EINK_WIDTH_           | _false_  | 800       | Display width in pixels. Used to scale the original image up or down to this width.   |
| _EINK_HEIGHT_          | _false_  | 480       | Display height in pixels. Used to scale the original image up or down to this height. |
| _LOCAL_FOLDERS_        | _false_  | `/images` | Comma separated list of folders to include in local image list                        |
| _LOCAL_EXCLUDE_        | _false_  | _empty_   | Comma separated list of (sub-)folder names to be excluded from _LOCAL_FOLDERS_        |
| _LOCAL_SHOW_HIDDEN_    | _false_  | _false_   | Wether to use hidden files (=starting with a dot) in _LOCAL_FOLDERS_.                 |

## Run Docker container

### Run with defaults

This will make the server available on port 3000 on the host machine.

    docker run -d \
        -p 3000:3000
        --name eInkServer \
        tfohlmeister/eink-display-server:latest

You can then load an eInk-optimized version of a random wallpaper at `http://$HOST_IP:3000/wallpaper.bmp`.

### Advanced examples

This command will mount a local image folder `/path/to/local/images`:

    docker run -d \
        --name eInkServer \
        -p 3000:3000 \
        -v /path/to/local/images:/images \
        tfohlmeister/eink-display-server:latest

The following command will mount two local image folders and excludes all folders called `PrivatePictures`:

    docker run -d \
        --name eInkServer \
        -p 3000:3000 \
        -v /path/to/local/images1:/images/images1 \
        -v /path/to/local/images2:/images/images2 \
        -e LOCAL_FOLDERS=/images/images1,/images/images2 \
        -e LOCAL_EXCLUDE=PrivatePictures \
        tfohlmeister/eink-display-server:latest

You should now be able to also display eInk-optimized versions of your mounted images at `http://$HOST_IP:3000/local.bmp`.

# Troubleshooting

If you see `Watcher Error`s in the log stating the `system limit for number of file watchers reached`, you need to [increase the amount of inotify watchers](https://github.com/guard/listen/wiki/Increasing-the-amount-of-inotify-watchers) on your (host) system. Restart the application afterwards.

If you found a bug or find this project is missing a feature please create an Issue.

# Development

### 1. Install dependencies

    npm install

### 2. Develop with auto-compiling and debugging enabled

    npm run watch-debug

### 3. Build server and container

    npm run build
    docker build --tag eink-display-server:latest .
