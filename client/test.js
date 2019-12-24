function api(url, params, method = 'GET') {
   const options = { method };

   if (params) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(params);
   }

   fetch(`/api/${url}`, options)
      .then(res => {
         if (res.status === 200) {
            if (res.headers.get('Content-Type')) return res.json();
            return 'OK';
         }
         throw res.statusText;
      })
      .then(data => {
         const key = `${method} ${url}`;
         if (!window.responses[key]) {
            window.responses[key] = [];
         }
         window.responses[key].push(data);
         console.log(data && JSON.stringify(data));
      })
      .catch(console.error);
}

function testAPI(event) {
   api.apply(null, tests[event.target.textContent]());
}

const tests = {
   'GET /users': () =>
      ['users'],
   'POST /users': () =>
      ['users', { name: `User${Date.now()}` }, 'POST'],
   'GET /users/self': () =>
      ['users/self'],
   'DELETE /users': () =>
      ['users', null, 'DELETE'],

   'GET /messages': () =>
      ['messages'],
   'POST /messages': () =>
      ['messages', {
         text: `${Date.now()}`
      }, 'POST'],

   'GET /records': () =>
      ['records'],
   'POST /records': () =>
      ['records', {
         game: document.getElementById('game').value
      }, 'POST'],
   'PATCH /records': () => {
      const data = window.responses['POST records'][window.responses['POST records'].length - 1];
      const id = data && data.id;
      return [`records/${id}`, {
         score: Math.floor(Math.random() * 1000)
      }, 'PATCH']
   },
};

function renderButtons() {
   Object.keys(tests).forEach(test => {
      const div = document.createElement('div');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = test;
      div.appendChild(button);
      document.body.appendChild(div);
      button.addEventListener('click', testAPI);
   })
}

window.responses = {};