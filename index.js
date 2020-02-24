'use strict'

const {exec} = require('child_process')
const {decode} = require('dns-packet')

const onMessage = (msg) => {
	const {type, questions, answers} = decode(msg)
	console.log(type, questions, answers)
}

;(async () => {
	const {stderr, stdout} = exec([
		'nc', // netcat
		'-6', // IPv6
		'-u', // UDP
		'-b', 'awdl0', // use the `awdl0` network interface
		'-l', '5353', // listen on 5353 for incoming data
		'-A' // enable SO_RECV_ANYIF to receive AWDL traffic
	].join(' '), {
		encoding: 'buffer'
	})
	stderr.pipe(process.stderr)

	stdout.on('error', console.error)
	stdout.on('data', onMessage)
})()
.catch((err) => {
	console.error(err)
	process.exit(1)
})
