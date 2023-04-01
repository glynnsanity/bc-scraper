// import puppeteer from 'puppeteer';
import configJSON from './config.json' assert { type: 'json' };
import { createNewURLSet } from './url-getters/getters.js';
import { scraperDecision } from './helpers/scrape-decider.js';
import { dedupeItems } from './utils/dedupe.js';
import { scrapeData } from "./helpers/scrape-data.js";
import { createCategoryAndProductInBigCommerce } from './helpers/bc-api.js';

/*
Process:
Check for existing master URL record, if non-existent get all URLs on the site
Functions will both write to a JSON file in the directory and return the same value
Now with the master list of URLs, create a 
*/

const { url, scraper }  = scraperDecision();
scraper(url, function(urls){
	let productFilterFunction = function(url){ return url.indexOf('/product/') !== -1; };
	let dedupedURLs = dedupeItems(urls, ['url']);
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
		count: 2355, 
		limit: 2357 
	};

	scrapeData(productURLSet, config, (data) => {
		if (data !== null) {
			createCategoryAndProductInBigCommerce(data);
		} else {
			console.log('Null data');
		}
	});
});