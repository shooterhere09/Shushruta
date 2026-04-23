const https = require('https');

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search?format=json&limit=1';

const geocodeAddress = async (street, city, state, postcode, country) => {
    const query = encodeURIComponent(`${street}, ${city}, ${state}, ${postcode}, ${country}`);
    const url = `${NOMINATIM_API_URL}&q=${query}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result && result.length > 0) {
                        const { lat, lon } = result[0];
                        resolve({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
                    } else {
                        resolve(null); // Address not found
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

module.exports = {
    geocodeAddress
};