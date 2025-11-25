import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env.AHA_API_URL;
const apiKey = process.env.AHA_API_KEY;

async function checkFeatureFields() {
  try {
    // Get Adastra 3.52 release ID
    const releasesResponse = await axios.get(
      `${apiUrl}/products/${process.env.AHA_PRODUCT_ID}/releases`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          fields: 'id,name',
          per_page: 200
        }
      }
    );

    const releases = releasesResponse.data.releases || [];
    const adastra352 = releases.find(r => r.name === 'Adastra 3.52');

    if (!adastra352) {
      console.log('Adastra 3.52 not found');
      return;
    }

    console.log(`Found Adastra 3.52: ${adastra352.id}\n`);

    // Fetch features WITHOUT specifying fields
    console.log('=== Fetching WITHOUT fields parameter ===\n');
    const response1 = await axios.get(
      `${apiUrl}/releases/${adastra352.id}/features`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          per_page: 1
        }
      }
    );

    if (response1.data.features && response1.data.features.length > 0) {
      console.log('Fields in feature object:');
      console.log(Object.keys(response1.data.features[0]).join(', '));
      console.log('\nworkflow_status field:');
      console.log(JSON.stringify(response1.data.features[0].workflow_status, null, 2));
    }

    // Fetch features WITH fields parameter
    console.log('\n\n=== Fetching WITH fields parameter ===\n');
    const response2 = await axios.get(
      `${apiUrl}/releases/${adastra352.id}/features`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          fields: 'id,name,description,workflow_status,release,created_at,updated_at',
          per_page: 1
        }
      }
    );

    if (response2.data.features && response2.data.features.length > 0) {
      console.log('Fields in feature object:');
      console.log(Object.keys(response2.data.features[0]).join(', '));
      console.log('\nworkflow_status field:');
      console.log(JSON.stringify(response2.data.features[0].workflow_status, null, 2));
    }

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

checkFeatureFields();
