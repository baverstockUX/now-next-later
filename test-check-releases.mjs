import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env.AHA_API_URL;
const apiKey = process.env.AHA_API_KEY;
const productId = process.env.AHA_PRODUCT_ID;

async function checkReleases() {
  try {
    // Get releases
    console.log('Fetching releases...');
    const response = await axios.get(
      `${apiUrl}/products/${productId}/releases`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          fields: 'id,name,reference_num,release_date',
          per_page: 20
        }
      }
    );

    const releases = response.data.releases || [];
    console.log(`Found ${releases.length} releases\n`);

    // Find FY27 and Adastra 3.52/3.53
    const interesting = releases.filter(r =>
      r.name.includes('FY27') ||
      r.name.includes('3.52') ||
      r.name.includes('3.53') ||
      r.name.includes('Pathways 50') ||
      r.name.includes('Pathways 49')
    );

    console.log('Looking for FY27, Adastra 3.52, 3.53, Pathways 50, 49:');
    interesting.forEach(r => {
      console.log(`  ${r.reference_num}: "${r.name}" - ${r.release_date}`);
    });

    // Now try to find features for one of these
    if (interesting.length > 0) {
      const testRelease = interesting[0];
      console.log(`\nTesting feature query for "${testRelease.name}"...`);

      const featResponse = await axios.get(
        `${apiUrl}/products/${productId}/features`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            fields: 'id,name,release',
            per_page: 5,
            q: `release.name:"${testRelease.name}"`
          }
        }
      );

      const features = featResponse.data.features || [];
      console.log(`  Found ${features.length} features`);
      if (features.length > 0) {
        features.forEach(f => {
          console.log(`    - ${f.name}`);
        });
      }
    }

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

checkReleases();
