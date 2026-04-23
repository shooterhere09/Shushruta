/**
 * MIGRATION SCRIPT - Add Hospital Info to Existing Orders
 * 
 * This script updates existing orders in the database to include hospital information.
 * It's safe to run multiple times - it will only update orders that don't have hospital info.
 * 
 * Usage: node migrate-hospital-info-to-orders.js [--dry-run]
 * 
 * Options:
 *   --dry-run    Show what would be updated without making changes
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const orderModel = require('./models/orders');
const productModel = require('./models/products');

const DATABASE = process.env.DATABASE || 'mongodb://127.0.0.1:27017/Shushruta';
const isDryRun = process.argv.includes('--dry-run');

async function migrateHospitalInfo() {
  try {
    // Connect to database
    await mongoose.connect(DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to database\n');

    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    } else {
      console.log('⚠️  LIVE MODE - Changes will be saved to database\n');
    }

    console.log('='.repeat(60));
    console.log('🏥 MIGRATING HOSPITAL INFO TO ORDERS');
    console.log('='.repeat(60));

    // Find orders without hospital info
    const ordersWithoutHospitals = await orderModel.find({
      $or: [
        { hospitals: { $exists: false } },
        { hospitals: { $size: 0 } }
      ]
    });

    console.log(`\nFound ${ordersWithoutHospitals.length} orders to update\n`);

    if (ordersWithoutHospitals.length === 0) {
      console.log('✅ All orders already have hospital information!\n');
      await mongoose.connection.close();
      return;
    }

    let updated = 0;
    let failed = 0;

    for (let i = 0; i < ordersWithoutHospitals.length; i++) {
      const order = ordersWithoutHospitals[i];
      
      try {
        console.log(`[${i + 1}/${ordersWithoutHospitals.length}] Processing Order ${order._id}`);

        // Fetch product details
        const productIds = order.allProduct.map((p) => p.id);
        const products = await productModel.find({ _id: { $in: productIds } });

        // Group hospitals by email to avoid duplicates
        const hospitalMap = new Map();
        for (const p of order.allProduct) {
          const prod = products.find((x) => String(x._id) === String(p.id));
          if (prod && prod.hemail) {
            if (!hospitalMap.has(prod.hemail)) {
              hospitalMap.set(prod.hemail, {
                hname: prod.hname,
                hemail: prod.hemail,
                hphone: prod.hphone,
              });
            }
          }
        }

        // Convert hospital map to array
        const hospitals = Array.from(hospitalMap.values());

        if (hospitals.length === 0) {
          console.log(`   ⚠️  No hospitals found for this order`);
          console.log(`   Products: ${order.allProduct.length}`);
          failed++;
          continue;
        }

        console.log(`   Found ${hospitals.length} hospital(s):`);
        hospitals.forEach((h) => {
          console.log(`     - ${h.hname} (${h.hemail})`);
        });

        if (!isDryRun) {
          // Update the order
          await orderModel.updateOne(
            { _id: order._id },
            { $set: { hospitals } }
          );
          console.log(`   ✅ Updated successfully\n`);
          updated++;
        } else {
          console.log(`   Would update with ${hospitals.length} hospital(s)\n`);
          updated++;
        }

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        failed++;
      }
    }

    console.log('='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total orders processed: ${ordersWithoutHospitals.length}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed: ${failed}`);

    if (!isDryRun) {
      console.log(`\n✅ Migration complete!`);
    } else {
      console.log(`\nTo apply migration, run: node migrate-hospital-info-to-orders.js`);
    }

    // Verify the migration
    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICATION');
    console.log('='.repeat(60));

    const ordersWithHospitals = await orderModel.find({
      hospitals: { $exists: true, $ne: [] }
    });

    console.log(`\nOrders with hospital info: ${ordersWithHospitals.length}`);

    // Show sample
    if (ordersWithHospitals.length > 0) {
      console.log('\nSample order with hospital info:');
      const sample = ordersWithHospitals[0];
      console.log(`  Order ID: ${sample._id}`);
      console.log(`  Hospitals: ${sample.hospitals.length}`);
      sample.hospitals.forEach((h) => {
        console.log(`    - ${h.hname} (${h.hemail})`);
      });
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
migrateHospitalInfo();

