// categories_order.cypher
// This script adds order properties to category nodes
// Run this script after init.cypher has created the categories

// Create index on Category.order for better query performance
CREATE INDEX FOR (c:Category) ON (c.order);

// Set order for weapon-type categories
MATCH (c:Category {name: '体'}) SET c.order = 1;
MATCH (c:Category {name: '杖'}) SET c.order = 2;
MATCH (c:Category {name: '剣'}) SET c.order = 3;
MATCH (c:Category {name: '槍'}) SET c.order = 4;
MATCH (c:Category {name: '斧'}) SET c.order = 5;
MATCH (c:Category {name: '弓'}) SET c.order = 6;

// Set order for magical categories
MATCH (c:Category {name: '合成術'}) SET c.order = 7;
MATCH (c:Category {name: '基本術'}) SET c.order = 8;
MATCH (c:Category {name: '固有術'}) SET c.order = 9;

// Set order for other categories
MATCH (c:Category {name: '固有技'}) SET c.order = 10;
MATCH (c:Category {name: '敵'}) SET c.order = 11;

// Set order for empty category (lowest priority, shown last)
MATCH (c:Category {name: ''}) SET c.order = 99;

// Verify categories have been updated
MATCH (c:Category)
RETURN c.name, c.order
ORDER BY c.order;
