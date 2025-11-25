import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env.AHA_API_URL;
const apiKey = process.env.AHA_API_KEY;
const productId = process.env.AHA_PRODUCT_ID;

async function getReleaseDetails() {
  try {
    // Get all releases and find Adastra 3.52
    console.log('Fetching all releases to find Adastra 3.52...\n');

    const response = await axios.get(
      `${apiUrl}/products/${productId}/releases`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          fields: 'id,name,reference_num',
          per_page: 200
        }
      }
    );

    const releases = response.data.releases || [];
    const adastra352 = releases.find(r => r.name === 'Adastra 3.52');

    if (adastra352) {
      console.log(`Found Adastra 3.52:`);
      console.log(`  ID: ${adastra352.id}`);
      console.log(`  Reference: ${adastra352.reference_num}`);

      // Now try to fetch features for this release using the release ID endpoint
      console.log('\n=== Fetching features from /releases/{id}/features ===\n');

      try {
        const featuresResponse = await axios.get(
          `${apiUrl}/releases/${adastra352.id}/features`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            params: {
              per_page: 50
            }
          }
        );

        const features = featuresResponse.data.features || [];
        console.log(`Found ${features.length} features in Adastra 3.52\n`);

        if (features.length > 0) {
          features.forEach(f => {
            console.log(`  ${f.reference_num || 'NO-REF'}: ${f.name}`);
            console.log(`    Status: ${f.workflow_status?.name || 'None'}`);
            console.log(`    Release: ${f.release?.name || 'None'}`);
            console.log('');
          });
        }
      } catch (err) {
        console.log(`Error fetching features: ${err.response?.status}`);
        console.log(err.response?.data);
      }

      // Also try /releases/{id}/requirements (Aha sometimes uses requirements instead of features)
      console.log('\n=== Trying /releases/{id}/requirements ===\n');

      try {
        const reqResponse = await axios.get(
          `${apiUrl}/releases/${adastra352.id}/requirements`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            params: {
              per_page: 50
            }
          }
        );

        const requirements = reqResponse.data.requirements || [];
        console.log(`Found ${requirements.length} requirements in Adastra 3.52\n`);

        if (requirements.length > 0) {
          requirements.forEach(r => {
            console.log(`  ${r.reference_num || 'NO-REF'}: ${r.name}`);
            console.log(`    Type: ${r.type_name || r.requirement_type?.name || 'Unknown'}`);
            console.log('');
          });
        }
      } catch (err) {
        console.log(`Error fetching requirements: ${err.response?.status}`);
        if (err.response?.data) {
          console.log(JSON.stringify(err.response.data, null, 2));
        }
      }

    } else {
      console.log('Adastra 3.52 not found in releases list');
    }

  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

getReleaseDetails();
