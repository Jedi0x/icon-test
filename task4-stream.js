const express = require("express");
const http = require("http");
const https = require("https");
const { Observable, forkJoin, of } = require("rxjs");
const { map, catchError, mergeMap } = require("rxjs/operators");
const app = express();

function sendRequest$(url) {
  return new Observable(observer => {
    const isHttps = url.startsWith('https://'); 
    const httpModule = isHttps ? https : http;
    const request = httpModule.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        sendRequest$(response.headers.location).subscribe({
          next: data => observer.next(data),
          error: err => observer.error(err),
          complete: () => observer.complete()
        });
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        console.log(data);
        observer.next(data);
        observer.complete();
      });
      
      response.on('error', (error) => {
        observer.error(error);
      });
     
    }).on('error', (error) => {
      observer.error(error);
    });
    
    return () => {
      request.destroy();
    };
  });
}

function getAddress$(address) {
  let url = address;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url;
  }
  
  console.log(`Processing URL: ${url}`);
  return sendRequest$(url).pipe(
    map(data => {
      let title = "NO RESPONSE";
      if (data) {
        const titleMatch = data.match(/<title[^>]*>(.*?)<\/title>/is);
        title = titleMatch ? titleMatch[1].trim() : "NO RESPONSE";
      }
      return { url: address, title };
    }),
    catchError(error => {
      console.error(`Error processing ${address}:`, error.message);
      return of({ url: address, title: "NO RESPONSE" });
    })
  );
}

app.get("/I/want/title", (req, res) => {
  const addresses = Array.isArray(req.query.address) ? req.query.address : [req.query.address];

  if (!addresses || !addresses[0]) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    return res.end('<h1>At least one address is required.</h1>');
  }
  
  const address$Array = addresses.map(address => getAddress$(address));
  
  forkJoin(address$Array).pipe(
    catchError(error => {
      console.error('Error processing addresses:', error);
      return of(addresses.map(addr => ({ url: addr, title: "NO RESPONSE" })));
    })
  ).subscribe({
    next: results => {
      renderView(res, results);
    },
    error: error => {
      console.error('Unexpected error:', error);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>Something went wrong.</h1>');
    }
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