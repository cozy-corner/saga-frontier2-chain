// categories_order.cypher
// This script adds order properties to category nodes
// Run this script after init.cypher has created the categories

// Create index on Category.order for better query performance
CREATE INDEX FOR (c:Category) ON (c.order);

// Batch set orders for all categories using UNWIND for better maintainability
UNWIND [
  {name: '体', order: 1},     // Body technique category
  {name: '杖', order: 2},     // Staff category
  {name: '剣', order: 3},     // Sword category
  {name: '槍', order: 4},     // Spear category
  {name: '斧', order: 5},     // Axe category
  {name: '弓', order: 6},     // Bow category
  {name: '合成術', order: 7}, // Synthesis magic category
  {name: '基本術', order: 8}, // Basic magic category
  {name: '固有術', order: 9}, // Unique magic category
  {name: '固有技', order: 10}, // Unique skill category
  {name: '敵', order: 11},    // Enemy category
  {name: '', order: 99}       // Empty category (lowest priority)
] AS cat
MATCH (c:Category {name: cat.name})
WHERE c.order IS NULL
SET c.order = cat.order;

// Set a default order for any new categories without an order
MATCH (c:Category)
WHERE c.order IS NULL
SET c.order = 100;

// Verify categories have been updated
MATCH (c:Category)
RETURN c.name, c.order
ORDER BY c.order;
