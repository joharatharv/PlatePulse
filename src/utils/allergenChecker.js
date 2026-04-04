/**
 * Allergen detection for Indian meals.
 *
 * For each standard allergen category we list ingredient/dish keywords that
 * are commonly found in Indian cooking. Custom allergens entered by the user
 * fall back to plain substring matching.
 */

const ALLERGEN_KEYWORDS = {
  'Peanuts': [
    'peanut', 'groundnut', 'moongphali', 'mungfali',
  ],
  'Tree Nuts': [
    'cashew', 'almond', 'walnut', 'pistachio',
    'kaju', 'badam', 'akhrot', 'pista',
    'hazelnut', 'pecan', 'macadamia', 'chestnut',
  ],
  'Dairy': [
    'milk', 'paneer', 'butter', 'ghee', 'curd', 'raita',
    'cream', 'yogurt', 'yoghurt', 'cheese', 'lassi',
    'kheer', 'malai', 'chaas', 'buttermilk', 'dahi',
    'makhani', 'shrikhand', 'chai', 'kulfi', 'rabdi',
    'rabri', 'halwa', 'khoya', 'mawa',
  ],
  'Eggs': [
    'egg', 'omelette', 'omelet', 'scrambled', 'anda', 'boiled egg',
  ],
  'Soy': [
    'soy', 'soya', 'tofu', 'edamame',
  ],
  'Wheat / Gluten': [
    'wheat', 'atta', 'maida', 'roti', 'naan', 'bread',
    'chapati', 'chapatti', 'paratha', 'poori', 'puri',
    'samosa', 'kulcha', 'bhatura', 'pav', 'bun',
    'pasta', 'noodle', 'vermicelli', 'seviyan',
  ],
  'Shellfish': [
    'prawn', 'shrimp', 'crab', 'lobster', 'crayfish',
    'jhinga', 'chingri', 'kolambi',
  ],
  'Fish': [
    'fish', 'tuna', 'salmon', 'cod', 'mackerel',
    'pomfret', 'rohu', 'catla', 'hilsa', 'surmai',
    'rawas', 'bangda', 'sole',
  ],
  'Sesame': [
    'sesame', 'til', 'tahini', 'gingelly',
  ],
};

/**
 * Given a list of food items and a user's allergen list, returns every
 * allergen that matched along with which items triggered it.
 *
 * @param {Array<{name: string}>} items   - food items from meal analysis
 * @param {string[]} userAllergens        - allergens from user profile
 * @returns {Array<{allergen: string, matchedItems: string[]}>}
 */
export function checkAllergens(items, userAllergens) {
  if (!userAllergens?.length || !items?.length) return [];

  const results = [];

  for (const allergen of userAllergens) {
    // Use keyword map if it exists; otherwise fall back to the allergen name itself
    const keywords = ALLERGEN_KEYWORDS[allergen]
      ? ALLERGEN_KEYWORDS[allergen]
      : [allergen.toLowerCase()];

    const matchedItems = items
      .filter(item =>
        keywords.some(kw => item.name.toLowerCase().includes(kw.toLowerCase()))
      )
      .map(item => item.name);

    if (matchedItems.length > 0) {
      results.push({ allergen, matchedItems });
    }
  }

  return results;
}

/**
 * Convenience wrapper for a full meal object (uses items if available,
 * falls back to the meal name string for older logged meals).
 */
export function checkMealAllergens(meal, userAllergens) {
  const items = meal.items?.length
    ? meal.items
    : [{ name: meal.name }];
  return checkAllergens(items, userAllergens);
}
