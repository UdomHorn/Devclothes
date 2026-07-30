require('dotenv').config();
const sequelize = require('./config/database');
const Product = require('./models/Product');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    // Fetch all products ordered by id ascending (chronological insertion order)
    const products = await Product.findAll({
      order: [['id', 'ASC']]
    });

    console.log(`Found ${products.length} products to migrate.`);

    // Keep track of counters for each prefix
    const counters = {};

    for (const product of products) {
      let prefix = '';
      if (product.category && product.category.toLowerCase() === 'collection' && product.collection) {
        prefix = product.collection.trim().toLowerCase();
      } else if (product.category) {
        prefix = product.category.trim().toLowerCase();
      } else {
        prefix = 'product';
      }

      // Clean prefix of any non-alphanumeric characters
      prefix = prefix.replace(/[^a-z0-9]/g, '');

      // Increment counter for this prefix
      if (!counters[prefix]) {
        counters[prefix] = 0;
      }
      counters[prefix] += 1;

      const nextNum = counters[prefix];
      const paddedNum = String(nextNum).padStart(2, '0');
      const newCode = `${prefix}-${paddedNum}`;

      console.log(`🔄 Migrating Product ID: ${product.id} ("${product.name}"): "${product.code}" ➡️ "${newCode}"`);
      
      // Update in database
      await product.update({ code: newCode });
    }

    console.log('\n🎉 ALL PRODUCT CODES MIGRATED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed with error:', err);
    process.exit(1);
  }
}

run();
