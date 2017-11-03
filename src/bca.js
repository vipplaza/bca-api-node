const qs = require('querystring')
const fs = require('await-fs');
const { exec } = require('child_process')
const { join } = require('async-child-process')
const Curl = require( 'node-libcurl' ).Curl

var curl = new Curl()

class BCA {
  constructor (conf) {
    this.conf = conf
    this.access_token = null;
    this.signature = null;
    this.timestamp = null;
    this.domain = 'sandbox.bca.co.id'
    this.main_url = 'https://'+this.domain; // Change When Your Apps is Live
  }
  async setSecret (secret) {
    this.client_id = secret.client_id;
    this.client_secret = secret.client_secret;
    this.api_key = secret.api_key;
    this.api_secret = secret.api_secret;
    this.corporate_id = secret.corporate_id;
    this.account_number = secret.account_number;
  }
  async curl (path, data, headers, method="POST"){
    var tmp = '/tmp/acm';
        
    var header_text = Object.keys(headers).map(key=>{
      return `-H "${key}: ${headers[key]}"`
    }).join(" ")

    var get_qs = "";
    var post_payload = ""
    if (method === "POST"){
      post_payload = `-d "${qs.stringify(data)}"`
    } else {
      get_qs = get_qs + (Object.keys(data).length === 0) ? "" : "?"
      get_qs = get_qs + `${qs.stringify(data)}`
    }
    
    var cmd = `curl "${this.main_url}${path}${get_qs}"  ${header_text} ${post_payload} > ${tmp}`;
    await join( exec(cmd) )
    var res = await fs.readFile(tmp,'utf8')
    return res
  }

	async getToken () {
    var keytoken = new Buffer(`${this.client_id}:${this.client_secret}`).toString('base64')
    var path = "/api/oauth/token"
    var data = {'grant_type': 'client_credentials'}
    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${keytoken}`
    }
    var res = await this.curl(path, data, headers)
    this.access_token = JSON.parse(res).access_token;
	}
	parseSignature (res) {
		this.signature = res.split(",")[8].split("CalculatedHMAC:")[1].trim()
	}
	parseTimestamp (res) {
		this.timestamp = res.split(",")[3].split("Timestamp:")[1].trim()
	}
	async getSignature (sign_target_path, method, data) {
		var path = '/utilities/signature';

    var now = new Date();
    // now = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
		var timestamp = now.toISOString();
    var offset = -1*now.getTimezoneOffset()/60+""
		timestamp = timestamp + "000+"+offset.padStart(2, 0)+":00"
		var url_encode = `${sign_target_path}`;

		var headers = {
			'Timestamp':timestamp,
			'URI':url_encode,
			'AccessToken':this.access_token,
			'APISecret':this.api_secret,
			'HTTPMethod':method
		}

    const res = await this.curl(path, data, headers)
    if (!res) process.exit();

		this.parseSignature(res);
		this.parseTimestamp(res);
	}
	async index () {
		await this.getToken();

		// Change this path to your desired API Services Path
    var qs_obj = {
      'EndDate': '2016-09-01',
      'StartDate': '2016-08-05'
    }
		var path = `/banking/v2/corporates/${this.corporate_id}/accounts/${this.account_number}/statements?${qs.stringify(qs_obj)}`
		var method = 'GET';
		await this.getSignature(path, method, {});

		var headers = {
			'X-BCA-Key': this.api_key,
			'X-BCA-Timestamp': this.timestamp,
			'Authorization': `Bearer ${this.access_token}`,
			'X-BCA-Signature': this.signature,
			'Content-Type': 'application/json',
			'Origin': require('os').hostname()
		}
    const res = await this.curl(path, {}, headers, method)
    if (!res) process.exit();
		return JSON.parse(res).Data;
	}

}


module.exports.BCA = BCA