// import puppeteer from 'puppeteer';
//import configJSON from './config.json' assert { type: 'json' };
// import { createNewURLSet } from './url-getters/getters.js';
// import { scraperDecision } from './helpers/scrape-decider.js';
// import { dedupeItems } from './utils/dedupe.js';
// import { scrapeData } from "./helpers/scrape-data.js";
// import { createCategoryAndProductInBigCommerce } from './helpers/bc-api.js';

/*
Process:
Check for existing master URL record, if non-existent get all URLs on the site
Functions will both write to a JSON file in the directory and return the same value
Now with the master list of URLs, create a 
*/

// const { url, scraper }  = scraperDecision();
// scraper(url, function(urls){
// 	let productFilterFunction = function(url){ return /^\/products\/[^\/]+\/[^\/]+$/.test(new URL(url).pathname) } ;
// 	let dedupedURLs = dedupeItems(urls, ['url']);
// 	let pathName = 'productURLs';
// 	const productURLSet = createNewURLSet(dedupedURLs, pathName, productFilterFunction);
// });

import getSiteUrls from "get-site-urls";

const urls = await getSiteUrls("abc.virginia.gov");

console.log('urls ', urls);