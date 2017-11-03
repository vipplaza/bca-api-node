'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const qs = require('querystring');
const fs = require('await-fs');
const { exec } = require('child_process');
const { join } = require('async-child-process');
const Curl = require('node-libcurl').Curl;

var curl = new Curl();

class BCA {
  constructor(conf) {
    this.conf = conf;
    this.access_token = null;
    this.signature = null;
    this.timestamp = null;
    this.domain = 'sandbox.bca.co.id';
    this.main_url = 'https://' + this.domain; // Change When Your Apps is Live
  }
  setSecret(secret) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.client_id = secret.client_id;
      _this.client_secret = secret.client_secret;
      _this.api_key = secret.api_key;
      _this.api_secret = secret.api_secret;
      _this.corporate_id = secret.corporate_id;
      _this.account_number = secret.account_number;
    })();
  }
  curl(path, data, headers, method = "POST") {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var tmp = '/tmp/acm';

      var header_text = Object.keys(headers).map(function (key) {
        return `-H "${key}: ${headers[key]}"`;
      }).join(" ");

      var get_qs = "";
      var post_payload = "";
      if (method === "POST") {
        post_payload = `-d "${qs.stringify(data)}"`;
      } else {
        get_qs = get_qs + (Object.keys(data).length === 0) ? "" : "?";
        get_qs = get_qs + `${qs.stringify(data)}`;
      }

      var cmd = `curl "${_this2.main_url}${path}${get_qs}"  ${header_text} ${post_payload} > ${tmp}`;
      yield join(exec(cmd));
      var res = yield fs.readFile(tmp, 'utf8');
      return res;
    })();
  }

  getToken() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      var keytoken = new Buffer(`${_this3.client_id}:${_this3.client_secret}`).toString('base64');
      var path = "/api/oauth/token";
      var data = { 'grant_type': 'client_credentials' };
      var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${keytoken}`
      };
      var res = yield _this3.curl(path, data, headers);
      _this3.access_token = JSON.parse(res).access_token;
    })();
  }
  parseSignature(res) {
    this.signature = res.split(",")[8].split("CalculatedHMAC:")[1].trim();
  }
  parseTimestamp(res) {
    this.timestamp = res.split(",")[3].split("Timestamp:")[1].trim();
  }
  getSignature(sign_target_path, method, data) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      var path = '/utilities/signature';

      var now = new Date();
      // now = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds())
      var timestamp = now.toISOString();
      var offset = -1 * now.getTimezoneOffset() / 60 + "";
      timestamp = timestamp + "000+" + offset.padStart(2, 0) + ":00";
      var url_encode = `${sign_target_path}`;

      var headers = {
        'Timestamp': timestamp,
        'URI': url_encode,
        'AccessToken': _this4.access_token,
        'APISecret': _this4.api_secret,
        'HTTPMethod': method
      };

      const res = yield _this4.curl(path, data, headers);
      if (!res) process.exit();

      _this4.parseSignature(res);
      _this4.parseTimestamp(res);
    })();
  }
  index() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      yield _this5.getToken();

      // Change this path to your desired API Services Path
      var qs_obj = {
        'EndDate': '2016-09-01',
        'StartDate': '2016-08-05'
      };
      var path = `/banking/v2/corporates/${_this5.corporate_id}/accounts/${_this5.account_number}/statements?${qs.stringify(qs_obj)}`;
      var method = 'GET';
      yield _this5.getSignature(path, method, {});

      var headers = {
        'X-BCA-Key': _this5.api_key,
        'X-BCA-Timestamp': _this5.timestamp,
        'Authorization': `Bearer ${_this5.access_token}`,
        'X-BCA-Signature': _this5.signature,
        'Content-Type': 'application/json',
        'Origin': require('os').hostname()
      };
      const res = yield _this5.curl(path, {}, headers, method);
      if (!res) process.exit();
      return JSON.parse(res).Data;
    })();
  }

}
exports.default = BCA;
