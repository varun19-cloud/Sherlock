/**
 * Database seeder — populates cases from caseData.js
 * Run: npm run seed
 */
require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const config = require('../config/config');
const Case = require('../models/Case');
const cases = require('./caseData');

const seed = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    // Clear existing cases
    await Case.deleteMany({});
    console.log('Cleared existing cases');

    // Insert all cases
    for (const caseData of cases) {
      await Case.create(caseData);
      console.log(`Seeded case: ${caseData.title}`);
    }

    console.log(`\n✅ Seeded ${cases.length} cases successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
