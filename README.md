# BCA API for NodeJS

## How to use
1. `npm i -S bca-api`
2. `import BCA from 'bca-api'` or see `sample/index.js` `test/main.js`
3. `Login to BCA developers and modify secret.json.sample`
4. Write some code with `await new BCA().index()`
5. Contact to `api_support@bca.co.id` and plan UAT on Whatsapp

## How it works
- Curl-exec impementation
- Reference implementation is [bca-php](https://github.com/ariemeow/bca-api)
- Tried to use `axios` but some difficulty regarding headers format was there. (I'm waiting for your pull-request!)
- `bca-php` worked well, so I choosed same way.

## How to test before contribution
- `npm i`
- `npm install node-libcurl --build-from-source`
- `npm run test`

## How to publish as npm package
- `npm run build`
- `npm publish`

## Note
- `/src` is written to work on `node-v8.6.0` or `babel-node`
- `/dist` is exported by babel to wrok on `node-v6.9.5`
- `client_id`, `client_secret`, `api_key`, `api_secret` are on [dashboard](https://developer.bca.co.id)
- `corporate_id` is on KlikBCA admin dashboard
- `account_number` is your company's bank account number

## Future plan
- Remove `--build-from-source` for `libcurl`
- Further testability
- Modern HTTP adaptor
- Multiple amount bank account handling for scalability
