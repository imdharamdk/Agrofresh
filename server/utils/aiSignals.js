const buildProductAiMeta = (product) => {
  const quantity = Number(product.quantity || 0);
  const basePrice = Number(product.price || 0);
  const demandScore = Number((Math.max(5, 100 - quantity) / 10).toFixed(2));
  const priceRecommendation = Number((basePrice * (1 + demandScore / 100)).toFixed(2));
  const smartTags = [];

  if (quantity < 10) smartTags.push('low-stock');
  if (product.bulkPrice > 0 && product.minBulkQty > 0) smartTags.push('bulk-ready');
  if (product.freshnessTag === 'Today Harvest') smartTags.push('today-harvest');
  if (product.category === 'Vegetables' || product.category === 'Fruits' || product.category === 'Organic') smartTags.push('fresh-harvest');
  if (product.isOrganic) smartTags.push('organic');

  return {
    demandScore,
    priceRecommendation,
    smartTags
  };
};

module.exports = {
  buildProductAiMeta
};
