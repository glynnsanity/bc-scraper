// import puppeteer from 'puppeteer';
import scrapy from 'node-scrapy';
import fetch from 'node-fetch';

function cleanData(data){
    if (data.name === null) {
        return null;
    } else {
        data.price = data.price.replace('Price: $', '');
        data.sku = data.sku.replace('Item #: ', '');
        // clean data to match BC API
        return data;
    }
}

export function scrapeData(urls, config, successCallback) {
    let currentURL = urls[config.count].url;
    fetch(currentURL)
        .then((res) => res.text())
        .then((body) => {
            const extractedData = scrapy.extract(body, config.model);
            let cleanExtractedData = cleanData(extractedData);
            successCallback(cleanExtractedData);
        })
        .catch(console.error);
    config.count += 1;
    if (config.count === config.limit) return console.log('finished');
    return setTimeout(scrapeData.bind(null, urls, config, successCallback), 5000);
}
