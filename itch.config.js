let BASE_URL = process.env.NODE_ENV === 'local' ? 'http://localhost' : 'https://ucodemy.com';
let BASE_URL_EXTENSION = process.env.NODE_ENV === 'local' ? '/itch' : (
    process.env.NODE_ENV === 'production' ? '/itch/public/public' : '/itch/dev/public'
);
let PROJECT_SERVER = `${BASE_URL}${BASE_URL_EXTENSION}/api/v1/`;
let ASSET_SERVER = 'https://d3dch2j0kvht3t.cloudfront.net/public/';
let BACKPACK_HOST = `${BASE_URL}${BASE_URL_EXTENSION}/api/v1/backpack`;
let BASE_PATH = './';

if (process.env.ITCH_LESSONS){
    BASE_URL = process.env.NODE_ENV === 'local' ? 'http://localhost:8080' : 'http://api.itchcode.com';
    BASE_URL_EXTENSION = '';
    PROJECT_SERVER = `${BASE_URL}${BASE_URL_EXTENSION}/api/`;
    ASSET_SERVER = 'https://d2ei2on0hts04r.cloudfront.net/';
    BACKPACK_HOST = `${BASE_URL}${BASE_URL_EXTENSION}/api/backpack`;
    BASE_PATH = process.env.PUBLIC_PATH ? `${process.env.PUBLIC_PATH}/` : './';
}
export default {
    BASE_URL,
    BASE_URL_EXTENSION,
    PROJECT_SERVER,
    ASSET_SERVER,
    BACKPACK_HOST,
    ITCH_LESSONS: process.env.ITCH_LESSONS,
    BASE_PATH
};
