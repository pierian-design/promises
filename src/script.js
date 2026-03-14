const delay = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));
const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Demo 1: Basic Promise with then/catch/finally
const basicPromise = () => {
  return delay(1000, 'Basic success')
    .then(value => value.toUpperCase())
    .finally(() => console.log('Basic finally'));
};

// Demo 2: Promise.all
const promiseAll = () => {
  const p1 = delay(800, 'Result 1');
  const p2 = delay(500, 'Result 2');
  const p3 = delay(1200, 'Result 3');

  return Promise.all([p1, p2, p3]).then(results => results.join(', '));
};

// Demo 3: Promise.race
const promiseRace = () => {
  const p1 = delay(1000, 'Slow');
  const p2 = delay(300, 'Fast');

  return Promise.race([p1, p2]).then(winner => `Winner: ${winner}`);
};

// Demo 4: Promise.any
const promiseAny = () => {
  const p1 = delay(600, 'First success');
  const p2 = Promise.reject(new Error('Failure'));
  const p3 = delay(800, 'Second success');

  return Promise.any([p1, p2, p3]).then(value => `First success: ${value}`);
};

// Demo 5: Promise.allSettled
const promiseAllSettled = () => {
  const p1 = delay(400, 'Good');
  const p2 = Promise.reject(new Error('Bad'));
  const p3 = delay(600, 'Another good');

  return Promise.allSettled([p1, p2, p3]).then(results => 
    results.map(r => r.status === 'fulfilled' ? r.value : r.reason.message).join(', ')
  );
};

// Demo 6: Promise.resolve / reject with chaining and abort (race condition handling)
const promiseWithAbort = () => {
  const controller = new AbortController();
  const signal = controller.signal;
  
  const fetchWithTimeout = new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve('Data loaded'), 1500);

    signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Aborted'));
    });
  });

  return fetchWithTimeout.finally(() => controller.abort());
};

// Demo 7: Using async/await with try/catch/finally
const asyncAwaitDemo = async () => {
  try {
    const result = await delay(700, 'Async/await result');
    return result;
  } catch (err) {
    throw err;
  } finally {
    console.log('Async/await finally');
  }
};

// Create card UI for each demo
const demos = [
  { name: 'Basic Promise (then/catch/finally)', fn: basicPromise },
  { name: 'Promise.all', fn: promiseAll },
  { name: 'Promise.race', fn: promiseRace },
  { name: 'Promise.any', fn: promiseAny },
  { name: 'Promise.allSettled', fn: promiseAllSettled },
  { name: 'AbortController + race condition', fn: promiseWithAbort },
  { name: 'Async/await with try/catch/finally', fn: asyncAwaitDemo }
];

const app = document.getElementById('app');
demos.forEach((demo, index) => {
  const card = document.createElement('div');

  card.className = 'card';
  card.innerHTML = `
  <h3>${demo.name}</h3>
  <button id="btn-${index}" class="async-button" data-loading-text="Processing...">Run</button>
  <div id="result-${index}" class="result">-</div>
  `;
  app.appendChild(card);

  const button = document.getElementById(`btn-${index}`);
  const resultDiv = document.getElementById(`result-${index}`);

  const asyncButton = new AsyncButton(button, async () => {
    const output = await demo.fn();
    resultDiv.textContent = output;
  }, (error) => {
    resultDiv.textContent = `Error: ${error.message}`;
  });
});