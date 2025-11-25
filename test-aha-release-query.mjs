import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env.AHA_API_URL;
const apiKey = process.env.AHA_API_KEY;
const productId = process.env.AHA_PRODUCT_ID;

async function testReleaseQuery() {
  try {
    // Test 1: Get features from FY27 release
    console.log('Test 1: Query features for release "FY27"');
    const response1 = await axios.get(
      `${apiUrl}/products/${productId}/features`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          fields: 'id,name,release',
          per_page: 5,
          q: 'release.name:"FY27"'
        }
      }
    );
    const count1 = response1.data.features ? response1.data.features.length : 0;
    console.log(`Found ${count1} features`);
    if (count1 > 0) {
      console.log('Sample feature:', JSON.stringify(response1.data.features[0], null, 2));
    }

    // Test 2: Get ANY feature and see its release structure
    console.log('\nTest 2: Get any features to see release structure');
    const response2 = await axios.get(
      `${apiUrl}/products/${productId}/features`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          fields: 'id,name,release',
          per_page: 5
        }
      }
    );
    const count2 = response2.data.features ? response2.data.features.length : 0;
    console.log(`Found ${count2} features`);
    if (count2 > 0) {
      response2.data.features.forEach((f, i) => {
        console.log(`\nFeature ${i+1}:`);
        console.log(`  Name: ${f.name}`);
        console.log(`  Release:`, JSON.stringify(f.release, null, 4));
      });
    }

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testReleaseQuery();
