/**
 * Dedupes items within an array based on properties given
 * 
 * @param array items
 *   Array of objects.
 * 
 * @param array propNames
 *   Array of strings that specify object properties. 
 * 
 */
export function dedupeItems(items, propNames) {
    const isPropValuesEqual = (subject, target, propNames) =>
      propNames.every(propName => subject[propName] === target[propName]);
  
    const getUniqueItemsByProperties = (items, propNames) => 
      items.filter((item, index, array) =>
        index === array.findIndex(foundItem => isPropValuesEqual(foundItem, item, propNames))
      );
  
    const dedupedItems = getUniqueItemsByProperties(items, propNames);
    return dedupedItems;
};