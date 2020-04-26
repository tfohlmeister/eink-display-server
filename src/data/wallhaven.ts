export interface WallhavenSearchResult {
    data: [{
        id: string;
        url: string;
        dimension_x: number;
        dimension_y: number;
    }];
}

export interface WallhavenWallpaperResult {
    data: {
        id: string;
        path: string;
    };
}