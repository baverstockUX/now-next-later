import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = process.env.AHA_API_URL;
const apiKey = process.env.AHA_API_KEY;
const productId = process.env.AHA_PRODUCT_ID;

const releasesToTest = [
  "FY27",
  "Adastra 3.53",
  "Adastra 3.52",
  "Adastra 3.51",
  "Adastra 3.50",
  "Adastra 3.49",
  "Pathways 50",
  "Pathways 49",
  "Pathways 48"
];

async function testFeatureCounts() {
  try {
    for (const releaseName of releasesToTest) {
      const response = await axios.get(
        `${apiUrl}/products/${productId}/features`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            fields: 'id,name',
            per_page: 200,
            q: `release.name:"${releaseName}"`
          }
        }
      );

      const features = response.data.features || [];
      const pagination = response.data.pagination || {};
      console.log(`${releaseName}: ${features.length} features (Total: ${pagination.total_records || features.length})`);

      if (features.length > 0) {
        console.log(`  Sample: ${features[0].name}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testFeatureCounts();
