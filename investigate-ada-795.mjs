import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env.AHA_API_URL;
const apiKey = process.env.AHA_API_KEY;
const productId = process.env.AHA_PRODUCT_ID;

async function investigateFeature() {
  try {
    // Search for feature with reference ADA-795
    console.log('Searching for feature ADA-795...\n');

    const searchResponse = await axios.get(
      `${apiUrl}/products/${productId}/features`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          q: 'reference_num:ADA-795',
          fields: 'id,name,reference_num,workflow_status,release,created_at,updated_at'
        }
      }
    );

    const features = searchResponse.data.features || [];
    console.log(`Found ${features.length} feature(s) matching ADA-795\n`);

    if (features.length > 0) {
      const feature = features[0];
      console.log('Feature Details:');
      console.log(`  Reference: ${feature.reference_num}`);
      console.log(`  Name: ${feature.name}`);
      console.log(`  Workflow Status: ${feature.workflow_status?.name || 'None'}`);
      console.log(`  Release:`, JSON.stringify(feature.release, null, 4));
      console.log(`  Created: ${feature.created_at}`);
      console.log(`  Updated: ${feature.updated_at}`);

      // Get full details of this feature
      console.log('\n--- Getting full feature details ---\n');
      const detailResponse = await axios.get(
        `${apiUrl}/features/${feature.id}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const fullFeature = detailResponse.data.feature;
      console.log('All available fields on feature:');
      console.log(JSON.stringify(fullFeature, null, 2));
    }

    // Also try to get features by release "Adastra 3.52"
    console.log('\n\n=== Searching for features in "Adastra 3.52" release ===\n');
    const releaseSearchResponse = await axios.get(
      `${apiUrl}/products/${productId}/features`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          q: 'release.name:"Adastra 3.52"',
          fields: 'id,name,reference_num,release',
          per_page: 20
        }
      }
    );

    const releaseFeatures = releaseSearchResponse.data.features || [];
    console.log(`Found ${releaseFeatures.length} features with query release.name:"Adastra 3.52"\n`);

    if (releaseFeatures.length > 0) {
      releaseFeatures.forEach(f => {
        console.log(`  ${f.reference_num}: ${f.name}`);
        console.log(`    Release: ${f.release?.name || 'None'}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

investigateFeature();
