import Crawler from 'node-html-crawler';
import scrapy from 'node-scrapy';
import fetch from 'node-fetch';
import { writeJsonFile } from 'write-json-file';
import { dedupeItems } from '../utils/dedupe.js';

export function crawlerURLs(domain) {
    let urlJSONArray = [];
    // const domain = process.argv[2];
    const crawler = new Crawler(domain);

    crawler.crawl();
    crawler.on('data', (data) => { 
        if (data.result.statusCode === '200') {
            urlJSONArray.push({ url: data.url });
        }
        console.log(data.result.statusCode, data.url) 
    });
    crawler.on('error', (error) => { console.error(error) });
    crawler.on('end', () => { console.log(`Finish! All urls on domain ${domain} a crawled!`) });

    const dedupedUrlJSON = dedupeItems(urlJSONArray, ['url']);
    writeJsonFile('./urls-dir/allURLs.js', dedupedUrlJSON);

    return dedupedUrlJSON;

}

export function scrapeSitemapURLs(siteMapUrl){
    const model = {
        urls: [
            'urlset url',
            {
                url: 'loc'
            }
    
        ]
    }

    let urls = '';

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
            urls = dedupedUrlJSON;
        })
        .catch(console.error)
    
    return urls;
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