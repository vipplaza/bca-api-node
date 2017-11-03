const qs = require('querystring')
const fs = require('await-fs');
const { exec } = require('child_process')
const { join } = require('async-child-process')
const Curl = require( 'node-libcurl' ).Curl

var curl = new Curl()

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

randomDate(new Date(2012, 0, 1), new Date())

function* random_range (m,n) {
  while (true) {
    yield Math.floor(Math.random() * n) + m;
  }
}

class BCAMock {
  constructor () {
  }
	async index () {
    return [...Array(1000).keys()].map(i=> {
      var d = randomDate(new Date(new Date().getFullYear(), 1, 1), new Date());
      return {
        TransactionDate: `${d.getDate().toString().padStart(2,0)}/${(d.getMonth()+1).toString().padStart(2,0)}`,
        BranchCode: '0'+random_range(100, 999).next().value,
        TransactionType: ['C','D'][random_range(0, 1).next().value],
        TransactionAmount: random_range(100000, 10000000).next().value,
        TransactionName: 'Pembayaran layanan XXX',
        Trailer: ''
      }
    })
	}
}


module.exports.BCAMock = BCAMock