#### BigCommerce Scraper

At the moment, this is fairly rudimentary, however it may be able to help save some clicks getting simple product data from a prospect site into a new POC sandbox. Take note that, for now, the crawling / scraping method here only allows you to filter based on URL structure (like "/product/" existing in the path) so sites without product specific URL structure likely won't fit this solution very well right now, though you could simply adjust the set of URLs that are being crawled manually in "index.js" on the first argument of the `scrapeData` function. Hoping to extend this to other methods at some point.

####
Also as of now, it will only scrape the product name, price, the main image src attribute, the category, and the sku number. For each of these items you will need to find the relevant selector on the PDP and enter it into the config.json file (that you'll need to create based on the example given ... I had issues with .env so I just made this config.json instead. ). Those selectors you enter in the config file will need to follow the pattern documented for [node-scrapy](https://www.npmjs.com/package/node-scrapy)

####
Things you will need to adjust in order for this to work:
- All of the fields in config.json (config.example.json)
- The filter function on line 13 of index.js depending on the merchant url structure
- The count && limit properties on the config object to be passed into the `scrapeData` function:
    - These will limit the amount of URLs to be scraped within the set provided in the first argument of the function. Some merchant sites of course will have ways of identifying crawlers. (I'm still learning about the ins and outs of this, starting with this: https://stackoverflow.com/questions/8404775/how-to-identify-web-crawler) .. 
    - Ergo, the reason for count and limit is to help with the above but also just to make easier to manage when pulling product data into your new sandbox.

####
Think that's it for now.