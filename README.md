# BCA API for NodeJS

## How to use
1. `npm i -S bca-api`
2. `import BCA from 'bca-api'`
3. `Login to BCA developers and modify secret.json.sample`
4. Write some code with `await new BCA().index()`
5. Contact to `api_support@bca.co.id` and plan UAT on Whatsapp

## How it works
- Curl-exec impementation
- Reference implementation is [bca-php](https://github.com/ariemeow/bca-api)
- Tried to use `axios` but some difficulty regarding headers format was there. (I'm waiting for your pull-request!)
- `bca-php` worked well, so I choosed same way.

## How to test before contribution
- Ready for ES7
- `npm i`
- `node test/main.js -e (sandbox|local)`

## Note
- `client_id`, `client_secret`, `api_key`, `api_secret` are on [dashboard](https://developer.bca.co.id)
- `corporate_id` is on KlikBCA admin dashboard
- `account_number` is your company's bank account number

## Future plan
- Lower version NodeJS support
- Multiple amount bank account handling for scalability
- Modern HTTP adaptor
- Further testability