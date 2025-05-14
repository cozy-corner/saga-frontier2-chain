// categories_order_schema.cypher - Schema changes only
// This script adds an index on the Category.order property
// Run this script after init.cypher has created the categories

// Create index on Category.order for better query performance
CREATE INDEX IF NOT EXISTS FOR (c:Category) ON (c.order);
