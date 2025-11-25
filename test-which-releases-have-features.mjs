import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env.AHA_API_URL;
const apiKey = process.env.AHA_API_KEY;
const productId = process.env.AHA_PRODUCT_ID;

async function findReleasesWithFeatures() {
  try {
    // Get features that are NOT in DONE status
    console.log('Fetching features with workflow status...');
    const response = await axios.get(
      `${apiUrl}/products/${productId}/features`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          fields: 'id,name,workflow_status,release',
          per_page: 50
        }
      }
    );

    const features = response.data.features || [];
    console.log(`Found ${features.length} features\n`);

    // Group by release
    const byRelease = {};
    features.forEach(f => {
      const releaseName = f.release ? f.release.name : 'No Release';
      const status = f.workflow_status ? f.workflow_status.name : 'No Status';

      if (!byRelease[releaseName]) {
        byRelease[releaseName] = [];
      }
      byRelease[releaseName].push({ name: f.name, status });
    });

    // Print summary
    Object.keys(byRelease).sort().forEach(releaseName => {
      const feats = byRelease[releaseName];
      console.log(`\n${releaseName} (${feats.length} features):`);
      feats.slice(0, 3).forEach(f => {
        console.log(`  - [${f.status}] ${f.name}`);
      });
      if (feats.length > 3) {
        console.log(`  ... and ${feats.length - 3} more`);
      }
    });

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

findReleasesWithFeatures();
