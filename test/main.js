import program from 'commander'
import BCA from '../src/bca'
import BCAMock from './bca_mock'
import fs from 'await-fs'

program
  .version('0.0.1')
  .option('--env [name]', 'Specify environment', 'local')
  .parse(process.argv)


class BcaTest {
  static async getIndex(conf) {
    var bca = null
    if (program.env === "local") {
      bca = new BCAMock()
    } else {
      var text = await fs.readFile("./secret.json",'utf8')
      var secret = JSON.parse(text)
      var bca = new BCA()
      bca.setSecret(secret[program.env])
    }
    return await bca.index()
  }
}

BcaTest.getIndex()
.then(res=>{
  var target = Object.keys(res[0])
  var answer = ['TransactionDate','BranchCode','TransactionType','TransactionAmount','TransactionName','Trailer']
  var testResult = target.sort().toString() == answer.sort().toString()   
  console.log(testResult)
})
.catch(err=>{
  console.error("error: "+err)
})
