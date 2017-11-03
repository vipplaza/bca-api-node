import BCA from 'bca-api'
// this example is for node-v8.6.0 or babel-node
// Please do this in async function...
var text = await fs.readFile("<pass_to_secret.json>",'utf8')
var secret = JSON.parse(text)
var bca = new BCA()
bca.setSecret(secret["<env>"])
var res = await bca.index()
