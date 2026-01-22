/**
 * Test API response for user 521
 */
import https from 'https';
import http from 'http';

const options = {
    hostname: '192.168.1.20',
    port: 3001,
    path: '/api/memberships/user/521/club/1',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer your_token_here',  // Not needed if endpoint doesn't require auth in dev
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:');
        console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
