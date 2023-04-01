import fs from 'fs';
import urlExist from "url-exist";
import configJSON from '../config.json' assert { type: 'json' };
import { crawlerURLGetter, scrapeSitemapURLGetter, fileURLGetter } from '../url-getters/getters.js';
const domain = configJSON.SOURCE_DOMAIN;
const urlFileExists = fs.existsSync('../urls-dir/allURLs.json');
const siteMapUrlExists = await urlExist(`${domain}sitemap.xml`);
const siteMapUrl = `${domain}sitemap.xml`;


export function scraperDecision() {
    

    function siteMapDecision(){
        return siteMapUrlExists ? { url: siteMapUrl, scraper: scrapeSitemapURLGetter } : { url: domain, scraper: crawlerURLGetter };
    }

    function scrapingDecision() {
        if (urlFileExists) {
            return { url: '', scraper: fileURLGetter };
        } else {
            return siteMapDecision();
        }
    }

    const scrapingObject = scrapingDecision();

    return scrapingObject;
}