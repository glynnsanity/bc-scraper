import Crawler from 'node-html-crawler';
import scrapy from 'node-scrapy';
import fetch from 'node-fetch';
import fs from 'fs';
import { writeJsonFile } from 'write-json-file';
import { dedupeItems } from '../utils/dedupe.js';

export function crawlerURLGetter(domain, callback) {
    let urlJSONArray = [];
    // const domain = process.argv[2];
    const crawler = new Crawler({
        protocol: 'https:', // default 'http:'
        domain: 'birds-eye.mybigcommerce.com', // default 'example.com'
        limitForConnections: 10, // number of simultaneous connections, default 10
        limitForRedirects: 5, // possible number of redirects, default 5
        timeout: 300 // number of milliseconds between pending connection, default 300
    });

    crawler.crawl();
    crawler.on('data', (data) => { 
        if (data.result.statusCode === '200') {
            urlJSONArray.push({ url: data.url });
        }
        console.log(data.result.statusCode, data.url) 
    });
    crawler.on('error', (error) => { console.error(error) });
    crawler.on('end', () => { 
        console.log(`Finish! All urls on domain ${domain} a crawled!`) 
        const dedupedUrlJSON = dedupeItems(urlJSONArray, ['url']);
        writeJsonFile('./urls-dir/allURLs.js', dedupedUrlJSON);
        callback(dedupedUrlJSON);
    });

}

export function scrapeSitemapURLGetter(siteMapUrl, callback){
    const model = {
        urls: [
            'urlset url',
            {
                url: 'loc'
            }
    
        ]
    }

    fetch(siteMapUrl)
        .then((res) => res.text())
        .then((body) => {
            let urlJSONArray = [];
            const extractedData = scrapy.extract(body, model);
            extractedData.urls.forEach(function(urlObject){
                urlJSONArray.push({ url: urlObject.url });
            });
            const dedupedUrlJSON = dedupeItems(urlJSONArray, ['url']);
            writeJsonFile('./urls-dir/allURLs.js', dedupedUrlJSON);
            callback(dedupedUrlJSON);
        })
        .catch(console.error)
}

export function fileURLGetter(url, callback){
    callback(fs.existsSync('./urls-dir/allURLs.json'));
}


export function createNewURLSet(urls, pathName, filterFn) {
    let newUrlArray = [];
    urls.forEach(function(urlObject){
        if (filterFn(urlObject.url)) {
            newUrlArray.push({ url: urlObject.url});
        }
    });

    let newUrlJSONSet = dedupeItems(newUrlArray, ['url']);
    writeJsonFile(`./urls-dir/${pathName}.json`, newUrlJSONSet);
    return newUrlJSONSet;
}