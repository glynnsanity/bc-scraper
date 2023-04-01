// import puppeteer from 'puppeteer';
// import urls from './urls-dir/allURLs.json';
import fs from 'fs';
import urlExist from "url-exist";
import configJSON from './config.json' assert { type: 'json' };
import { crawlerURLs, scrapeSitemapURLs, createNewURLSet } from './url-getters/getters.js';
import { dedupeItems } from './utils/dedupe.js';
import { scrapeData } from "./helpers/scrape-data.js";
import { createCategoryAndProductInBigCommerce } from './helpers/bc-api.js';
const domain = configJSON.SOURCE_DOMAIN;

// this will be used to filter against the URL structure
let productFilterFunction = function(url){
	return url.indexOf('/product/') !== -1;
};

/*
Process:
Check for existing master URL record, if non-existent get all URLs on the site
Functions will both write to a JSON file in the directory and return the same value
Now with the master list of URLs, create a 
*/

let urls = '';
if (!fs.existsSync('./urls-dir/allURLs.json')) {
	const siteMapUrlExists = await urlExist(`${domain}sitemap.xml`);
	urls = siteMapUrlExists ? scrapeSitemapURLs(`${domain}sitemap.xml`) : crawlerURLs(domain);
} else {
	urls = fs.readFileSync('./urls-dir/allURLs.json', 'utf-8');
}

let dedupedURLs = dedupeItems(JSON.parse(urls), ['url']);
let pathName = 'productURLs';
const productURLSet = createNewURLSet(dedupedURLs, pathName, productFilterFunction);

/*
config:
- model: object of selectors to pull product data from on the pdp
  - (only supports name, img, category, and price currently)
- count: number for counting the amount of times a url is being hit, meant to reduce likelihood of being blocked
- limit: the amount when the sequence of url calls will stop
*/
let config = { 
	model: {
		name: configJSON.NAME_SELECTOR,
		img: configJSON.IMG_SELECTOR,
		category: configJSON.CATEGORY_SELECTOR,
		price: configJSON.PRICE_SELECTOR,
		sku: configJSON.SKU_SELECTOR,
	}, 
	count: 2250, 
	limit: 2253 
};

scrapeData(productURLSet, config, (data) => {
	createCategoryAndProductInBigCommerce(data);
});