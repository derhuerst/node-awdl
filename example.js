'use strict'

const {decode} = require('dns-packet')
const {isSupported, listenOnAWDL} = require('.')

if (!isSupported()) {
	console.error('AWDL does not seem to be supported on your device')
	process.exit(1)
}

// mDNS + DNS-SD over AWDL a.k.a. "iPhone magically find Mac with AirDrop"
const awdl = listenOnAWDL(5353, {udp: true, recvAnyif: true})

awdl.on('error', (err) => {
	console.error(err)
	process.exit(1)
})

awdl.on('data', (msg) => {
	const {type, questions, answers} = decode(msg)
	console.log(type, questions, answers)
})
