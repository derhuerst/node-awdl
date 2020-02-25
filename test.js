'use strict'

const {decode} = require('dns-packet')
const {isSupported, listenOnAWDL} = require('.')

const onError = (err) => {
	console.error(err)
	process.exit(1)
}

const isAirDropMetaRecord = rec => (
	rec.class === 'IN' &&
	rec.type === 'PTR' &&
	rec.name === '_services._dns-sd._udp.local' &&
	rec.data === '_airdrop._tcp.local'
)
const isAirDropAnnouncementRecord = rec => (
	rec.class === 'IN' &&
	rec.type === 'PTR' &&
	rec.name === '_airdrop._tcp.local' &&
	rec.data.slice(-20) === '._airdrop._tcp.local'
)
const isAirDropPayloadRecord = rec => (
	rec.class === 'IN' &&
	rec.type === 'TXT' &&
	rec.name.slice(-20) === '._airdrop._tcp.local'
)
const isAirDropRecord = rec => (
	isAirDropMetaRecord(rec) ||
	isAirDropAnnouncementRecord(rec) ||
	isAirDropPayloadRecord(rec)
)

if (!isSupported()) onError('AWDL does not seem to be supported on your device')

// mDNS + DNS-SD over AWDL a.k.a. "iPhone magically find Mac with AirDrop"
const awdl = listenOnAWDL(5353, {udp: true, recvAnyif: true})
awdl.on('error', onError)

console.info(`\
The only reliable way to test this package is to use real devices.

Please get an iOS/macOS device and try to send something via AirDrop
to this machine. This machine *must not* be connected to a Wi-Fi network,
and AirDrop needs to be configured to listen!

This script will wait for a "handshake" DNS-SD packet for 10 seconds.
`)

awdl.once('data', (msg) => {
	const {answers} = decode(msg)
	if (answers.some(isAirDropRecord)) {
		console.info('Received an AirDrop packet, destroying. ✔︎')
		awdl.destroy()
		clearTimeout(failTimer)
	}
})

const failTimer = setTimeout(() => {
	console.error(`Didn't receive a packet within 10 seconds. :(`)
	process.exit(2)
}, 10_000)
