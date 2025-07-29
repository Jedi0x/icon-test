# Website Title Fetcher - Multiple Implementation Strategies

A Node.js web server that fetches and displays website titles using different asynchronous programming approaches. This project demonstrates four different strategies for handling concurrent HTTP requests and asynchronous operations.

## 📋 Project Overview

The server responds to the route `GET /I/want/title` and accepts website addresses as query parameters. It fetches the `<title>` tags from each website and returns them in a formatted HTML response.

### Example Usage:
```
GET /I/want/title?address=google.com&address=github.com
GET /I/want/title?address=http://yahoo.com
GET /I/want/title?address=google.com&address=www.dawn.com/events/
```

### Expected Response:
```html
<html>
  <body>
    <h1>Following are the titles of given websites:</h1>
    <ul>
      <li>google.com - "Google"</li>
      <li>github.com - "GitHub: Let's build from here"</li>
    </ul>
  </body>
</html>
```

## 🚀 Quick Start

### Installation
```bash
git clone https://github.com/Jedi0x/icon-test.git
cd icon-test
npm install
```

### Run Any Task
```bash
# Choose any implementation strategy:
npm run task1  # Callbacks
npm run task2  # Async.js
npm run task3  # Promises  
npm run task4  # RxJS Streams
```

Then visit: `http://localhost:3000/I/want/title?address=google.com&address=github.com`

## 📁 Implementation Strategies

### 1️⃣ Task 1: Pure Callbacks (`task1-callback.js`)
**Strategy**: Manual concurrency control with counters
```javascript
// No external dependencies for async control
let completed = 0;
addresses.forEach(address => {
  sendRequest(url, (error, data) => {
    completed++;
    if (completed === addresses.length) {
      renderView();
    }
  });
});
```

### 2️⃣ Task 2: Async.js Library (`task2-async.js`)
**Strategy**: Library-managed parallel execution
```javascript
// Uses async.map for clean parallel processing
async.map(addresses, getAddress, (error, results) => {
  if (error) handleError(error);
  else renderView(res, results);
});
```

**Dependencies:**
- `async` - Async utilities library

### 3️⃣ Task 3: Native Promises (`task3-promise.js`)
**Strategy**: Promise-based coordination
```javascript
// Modern Promise.all approach
const promises = addresses.map(address => getAddress(address));
Promise.all(promises)
  .then(results => renderView(res, results))
  .catch(error => handleError(error));
```


### 4️⃣ Task 4: RxJS Streams (`task4-stream.js`)
**Strategy**: Reactive programming with Observables
```javascript
// Reactive stream processing
const address$Array = addresses.map(address => getAddress$(address));
forkJoin(address$Array).subscribe({
  next: results => renderView(res, results),
  error: error => handleError(error)
});
```

**Dependencies:**
- `rxjs` - Reactive Extensions library


## 🔧 Running Individual Tasks

### Task 1 - Callbacks
```bash
npm run task1
# Server starts on http://localhost:3000
```

### Task 2 - Async.js
```bash
npm run task2
# Server starts on http://localhost:3000
```

### Task 3 - Promises
```bash
npm run task3
# Server starts on http://localhost:3000
```

### Task 4 - RxJS Streams
```bash
npm run task4
# Server starts on http://localhost:3000
```

## 🧪 Testing

### Basic Test
```bash
curl "http://localhost:3000/I/want/title?address=google.com"
```

### Multiple Addresses
```bash
curl "http://localhost:3000/I/want/title?address=google.com&address=github.com&address=stackoverflow.com"
```

### Error Handling Test
```bash
curl "http://localhost:3000/I/want/title?address=invalid-domain-12345"
```



### Response Format:
- Content-Type: `text/html`
- Status: `200` for success, `400` for bad requests, `404` for unknown routes
- Clean HTML structure with proper titles

## 📦 Dependencies

```json
{
  "dependencies": {
    "express": "^5.1.0",     // Web framework (all tasks)
    "async": "^3.2.6",       // Async utilities (task2)
    "rxjs": "^7.x.x",        // Reactive extensions (Bonus Task)
  }
}
```

## 🏗️ Project Structure

```
icon-test/
├── package.json              # Dependencies and scripts
├── README.md                 # This file
├── task1-callback.js         # Pure callback implementation
├── task2-async.js           # Async.js library implementation
├── task3-promise.js         # Promise-based implementation
└── task4-stream.js          # RxJS reactive implementation
```