import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env.AHA_API_URL;
const apiKey = process.env.AHA_API_KEY;
const productId = process.env.AHA_PRODUCT_ID;

async function investigateAPIStructure() {
  try {
    // Check if there are requirements/initiatives/epics under a release
    console.log('=== Checking Adastra 3.52 release details ===\n');

    // First, get the release ID for Adastra 3.52
    const releasesResponse = await axios.get(
      `${apiUrl}/products/${productId}/releases`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          q: 'name:"Adastra 3.52"',
          fields: 'id,name,reference_num'
        }
      }
    );

    const releases = releasesResponse.data.releases || [];
    console.log(`Found ${releases.length} releases matching "Adastra 3.52"\n`);

    if (releases.length > 0) {
      const release = releases[0];
      console.log(`Release: ${release.name}`);
      console.log(`  ID: ${release.id}`);
      console.log(`  Reference: ${release.reference_num}`);

      // Try to get full release details
      console.log('\n--- Getting full release details ---\n');
      const releaseDetailResponse = await axios.get(
        `${apiUrl}/releases/${release.id}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const fullRelease = releaseDetailResponse.data.release;
      console.log('Full release object:');
      console.log(JSON.stringify(fullRelease, null, 2));

      // Try to get features via release endpoint
      console.log('\n\n=== Trying to get features via /releases/{id}/features ===\n');
      try {
        const releaseFeaturesResponse = await axios.get(
          `${apiUrl}/releases/${release.id}/features`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            params: {
              per_page: 20
            }
          }
        );
        const features = releaseFeaturesResponse.data.features || [];
        console.log(`Found ${features.length} features`);
        if (features.length > 0) {
          features.forEach(f => {
            console.log(`  ${f.reference_num}: ${f.name}`);
          });
        }
      } catch (err) {
        console.log(`Error: ${err.response?.status} - ${err.response?.statusText}`);
        console.log(JSON.stringify(err.response?.data, null, 2));
      }
    }

    // Also try searching for any reference starting with ADA-7
    console.log('\n\n=== Searching for features with reference ADA-7* ===\n');
    const searchResponse = await axios.get(
      `${apiUrl}/products/${productId}/features`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          q: 'reference_num:ADA-7*',
          fields: 'id,name,reference_num,release',
          per_page: 10
        }
      }
    );

    const searchFeatures = searchResponse.data.features || [];
    console.log(`Found ${searchFeatures.length} features with reference starting with ADA-7`);
    if (searchFeatures.length > 0) {
      searchFeatures.forEach(f => {
        console.log(`  ${f.reference_num}: ${f.name}`);
        console.log(`    Release: ${f.release?.name || 'None'}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

investigateAPIStructure();
