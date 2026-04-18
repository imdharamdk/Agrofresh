const CATEGORY_OPTIONS = ['Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy', 'Organic'];
const UNIT_OPTIONS = ['kg', 'gram', 'litre', 'piece'];
const FRESHNESS_OPTIONS = ['Today Harvest', 'Fresh', 'Regular'];

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const parseHarvestDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getFreshnessTag = (value) => {
  const harvestDate = parseHarvestDate(value);
  if (!harvestDate) return 'Regular';

  const today = startOfDay();
  const harvestDay = startOfDay(harvestDate);
  const diffDays = Math.round((today - harvestDay) / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) return 'Today Harvest';
  if (diffDays <= 3) return 'Fresh';
  return 'Regular';
};

const getStockTag = (quantity) => {
  const availableQty = Number(quantity || 0);
  if (availableQty <= 0) return 'Out of Stock';
  if (availableQty < 10) return 'Low Stock';
  return 'In Stock';
};

const buildLocationRegex = (location) => {
  const trimmed = String(location || '').trim();
  if (!trimmed) return null;
  return new RegExp(escapeRegex(trimmed), 'i');
};

module.exports = {
  CATEGORY_OPTIONS,
  UNIT_OPTIONS,
  FRESHNESS_OPTIONS,
  parseHarvestDate,
  getFreshnessTag,
  getStockTag,
  buildLocationRegex
};
