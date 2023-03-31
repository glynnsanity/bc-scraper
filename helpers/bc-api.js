import fetch from 'node-fetch';
import configJSON from '../config.json' assert { type: 'json' };
const store_hash = configJSON.BC_STORE_HASH;
const AUTH_TOKEN = configJSON.BC_AUTH_TOKEN;


/**
 * Sends POST to create a category with no parent.
 * In POST response, two actions may take place:
 * 1) If 409 status (duplicate category), call getIDFromCategories
 * 2) If else, createProductInBigCommerce is called with newly created category ID passed through
 * 
 *
 * @param object data
 *   An object containing:
 *   - name: The name of the product being parsed through
 *   - img: The image of the product.
 *   - category: The category name.
 *   - price: The product price.
 *
 */
export function createCategoryAndProductInBigCommerce(data){
    const createCategoryEndpoint = `https://api.bigcommerce.com/stores/${store_hash}/v3/catalog/categories`;
    let options = {
        method: 'post',
        headers: {'Content-Type': 'application/json', 'X-Auth-Token': AUTH_TOKEN},
        body: `{ "parent_id": "0", "name": "${data.category}" }`
    };

    fetch(createCategoryEndpoint, options)
        .then(res => res.json())
        .then((json) => {
            if (json.status === 409) {
                getCatIDFromCategories(data);
            } else {
                let categoryID = json.data.id;
                createProductInBigCommerce(data, categoryID);
            }  
        })
        .catch(err => console.error('Create Category Error: ' + err));
}


/**
 * Sends POST to create a product within a given category.
 * In POST response, a call is made to assign the product to a channel
 * 
 *
 * @param object data
 *   An object containing:
 *   - name: The name of the product being parsed through
 *   - img: The image of the product.
 *   - category: The category name.
 *   - price: The product price.
 * 
 * @param number id
 *   A number value for the category ID.
 * 
 *
 */
export function createProductInBigCommerce(data, id){
    const createProductEndpoint = `https://api.bigcommerce.com/stores/${store_hash}/v3/catalog/products`;
    let options = {
        method: 'post',
        headers: {'Content-Type': 'application/json', 'X-Auth-Token': AUTH_TOKEN},
        body: JSON.stringify({ 
            type: 'physical', 
            name: data.name, 
            price: data.price, 
            weight: 10, 
            images: [{ 
                image_url: data.img, 
                is_thumbnail: true
            }], 
            categories: [id] 
        })
    };
      
    fetch(createProductEndpoint, options)
        .then(res => res.json())
        .then((json) => {
            if (json.status !== 409) {
                createProductChannelAssignment(json.data.id);
            } else {
                console.log('duplicate product');
            }
        })
        .catch(err => console.error('Create Product Error: ' + err));
}


/**
 * Sends PUT to update the channel assignment for a product.
 * 
 * 
 * @param number id
 *   A number value for the product ID.
 * 
 */
export function createProductChannelAssignment(id){
    const createProductChannelAssignmentEndpoint = `https://api.bigcommerce.com/stores/${store_hash}/v3/catalog/products/channel-assignments`;
    let options = {
        method: 'put',
        headers: {'Content-Type': 'application/json', 'X-Auth-Token': AUTH_TOKEN},
        body: `[{"product_id":${id},"channel_id":1}]`,
    };
    fetch(createProductChannelAssignmentEndpoint, options)
        .then(res => console.log('success'))
        .catch(err => console.error('Create Product Channel Assignment Error: ' + err));
}


/**
 * Sends GET to retrieve all categories on a store 
 * then find any existing categories that match the value given in "data.category".
 * 
 * 
 * @param object data
 *   The object data retrieved from the product page scrape.
 *   - name: The name of the product being parsed through
 *   - img: The image of the product.
 *   - category: The category name.
 *   - price: The product price.
 * 
 */
export function getCatIDFromCategories(data) {
    const categoriesEndpoint = `https://api.bigcommerce.com/stores/${store_hash}/v3/catalog/categories`;
    let options = {
      method: 'get',
      headers: {'Content-Type': 'application/json', 'X-Auth-Token': AUTH_TOKEN},
    };

    fetch(categoriesEndpoint, options)
          .then(res => res.json())
          .then((json) => {
            let categoriesArr = json.data;
            let getExistingCategoryID = (categoriesArr, name) => {
              let matchedCategories = categoriesArr.filter(function(category){
                return category.name === name;
              });
            
              if (matchedCategories.length === 1) {
                return matchedCategories[0].id;
              } else {
                console.log('Error in Category Match');
                return undefined;
              }
            }
            let categoryID = getExistingCategoryID(categoriesArr, data.category);
            createProductInBigCommerce(data, categoryID);
          })
          .catch(err => console.error('Create Product Error: ' + err));
}



/**
 * Sends GET to retrieve all categories on a store 
 * then find any existing categories that match the value given in "data.category".
 * 
 * 
 * @param object data
 *   The object data retrieved from the product page scrape.
 *   - name: The name of the product being parsed through
 *   - img: The image of the product.
 *   - category: The category name.
 *   - price: The product price.
 * 
 */
export function updateProductInBigCommerce(productData){
    const updateProductEndpoint = `https://api.bigcommerce.com/stores/${store_hash}/v3/catalog/products/${productData.id}`;
    let options = {
        method: 'put',
        headers: {'Content-Type': 'application/json', 'X-Auth-Token': AUTH_TOKEN},
        body: JSON.stringify({ 
            type: productData.type,
            name: productData.name,
            weight: productData.weight,
            price: productData.price,
            sku: `RTC-${productData.id}`
        })
    };
      
    fetch(updateProductEndpoint, options)
        .then(res => res.json())
        .then((json) => {
            console.log('JSON ', json);
        })
        .catch(err => console.error('Create Product Error: ' + err));
}



/**
 * Sends GET to retrieve all categories on a store 
 * then find any existing categories that match the value given in "data.category".
 * 
 * 
 * @param object data
 *   The object data retrieved from the product page scrape.
 *   - name: The name of the product being parsed through
 *   - img: The image of the product.
 *   - category: The category name.
 *   - price: The product price.
 * 
 */
function getProducts() {
    const endpoint = `https://api.bigcommerce.com/stores/${store_hash}/v3/catalog/products`;
    let options = {
      method: 'get',
      headers: {'Content-Type': 'application/json', 'X-Auth-Token': AUTH_TOKEN},
    };
    fetch(endpoint, options)
          .then(res => res.json())
          .then((json) => {
            let productArr = json.data;

            productArr.forEach(function(product){
                if (!product.sku.length) {
                    console.log('product update initiated ', product.name);
                    const productData = product;
                    updateProductInBigCommerce(productData);
                }
            });
          })
          .catch(err => console.error('Create Product Error: ' + err));
}

