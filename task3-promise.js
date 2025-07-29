const express = require("express");
const http = require("http");
const https = require("https");
const app = express();

function sendRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const httpModule = isHttps ? https : http;
    httpModule.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return sendRequest(response.headers.location)
          .then(resolve)
          .catch(reject);
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
      
      response.on('error', (error) => {
        reject(error);
      });
        
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function getAddress(address) {
  let url = address;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url;
  }
  
  console.log(`Processing URL: ${url}`);
  return sendRequest(url)
    .then(data => {
      let title = "NO RESPONSE";
      if (data) {
        const titleMatch = data.match(/<title[^>]*>(.*?)<\/title>/is);
        title = titleMatch ? titleMatch[1].trim() : "NO RESPONSE";
      }
      return { url: address, title };
    })
    .catch(error => {
      console.error(`Error processing ${address}:`, error.message);
      return { url: address, title: "NO RESPONSE" };
    });
}

app.get("/I/want/title", (req, res) => {
  const addresses = Array.isArray(req.query.address) ? req.query.address : [req.query.address];

  if (!addresses || !addresses[0]) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    return res.end('<h1>At least one address is required.</h1>');
  }
  
  const promises = addresses.map(address => getAddress(address));
  
  Promise.all(promises)
    .then(results => {
      renderView(res, results);
    })
    .catch(error => {
      console.error('Error processing addresses:', error);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>Something went wrong.</h1>');
    });
});

function renderView(res, results) {
  const html = `
    <html>
      <body>
        <h1>Following are the titles of given websites:</h1>
        <ul>
          ${results.map(result => `<li>${result.url} - ${result.title}</li>`).join('')}
        </ul>
      </body>
    </html>`;
    
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

app.use((req, res) => {
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 Not Found</h1>');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
}); 