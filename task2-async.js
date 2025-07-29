const express = require("express");
const http = require("http");
const https = require("https");
const async = require("async");
const app = express();

function sendRequest(url, callback) {
  const isHttps = url.startsWith('https://');
  const httpModule = isHttps ? https : http;
  httpModule.get(url, (response) => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      return sendRequest(response.headers.location, callback);
    }
    
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      callback(null, data);
    });
      
  }).on('error', (error) => {
    callback(error, null);
  });
}

function getAddress(address, callback) {
  let url = address;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url;
  }
  
  console.log(`Processing URL: ${url}`);
  sendRequest(url, (error, data) => {
    let title = "NO RESPONSE";
    if (!error && data) {
      const titleMatch = data.match(/<title[^>]*>(.*?)<\/title>/is);
      title = titleMatch ? titleMatch[1].trim() : "NO RESPONSE";
    }
    callback(null, { url: address, title });
  });
}

app.get("/I/want/title", (req, res) => {
  const addresses = Array.isArray(req.query.address) ? req.query.address : [req.query.address];

  if (!addresses || !addresses[0]) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    return res.end('<h1>At least one address is required.</h1>');
  }
  async.map(addresses, getAddress, (error, results) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      return res.end('<h1>Something went wrong.</h1>');
    }
    renderView(res, results);
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