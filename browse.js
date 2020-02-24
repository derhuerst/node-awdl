'use strict'

const {parse: parseIpAddress} = require('ipaddr.js')
const {networkInterfaces} = require('os')
const {createSocket} = require('dgram')
const {decode} = require('dns-packet')
const setsockopt = require('./lib/setsockopt')
const browse = require('multicast-dns')

// const isIPv6Loopback = (address) => {
// 	const firstPart = parseIpAddress(address).parts[0] || 0
// 	return firstPart.toString(2).slice(0, 10) === '1111111010'
// }
const isProperInterface = ({family, address}) => {
	// return family === 'IPv6' && !isIPv6Loopback(address)
	return family === 'IPv6'
}

const awdl0 = (networkInterfaces().awdl0 || []).find(isProperInterface)
if (!awdl0) throw new Error('no awdl0 interface found')
// const en0 = (networkInterfaces().en0 || []).find(isProperInterface)
// if (!en0) throw new Error('no en0 interface found')

// const browser = browse({
// 	type: 'udp6',
// 	// interface: awdl0.address
// 	interface: en0.address + '%en0'
// })

// browser.on('response', res => console.log('response:', res))
// browser.on('query', q => console.log('query:', q))

// browser.query({
// 	questions:[{name: '_airdrop._tcp.local.', type: 'PTR'}]
// })

const SOL_SOCKET = 0x1
// https://github.com/torvalds/linux/blob/a2d79c7174aeb43b13020dd53d85a7aefdd9f3e5/include/uapi/asm-generic/socket.h#L27
const SO_REUSEPORT = 15
// https://opensource.apple.com/source/xnu/xnu-4570.31.3/bsd/sys/socket.h :318
const SO_RECV_ANYIF = 0x1104
// https://www.iana.org/assignments/ipv6-multicast-addresses/ipv6-multicast-addresses.xhtml
const MDNSv6_MULTICAST_GROUP = 'ff02::fb'

const MDNSv4_MULTICAST_GROUP = '224.0.0.251'
const AWDL_CLASS = 'UNKNOWN_32769' // todo

const scope = '%awdl0'
// const ip = '::'
const ip = awdl0.address

const onMessage = (msg) => {
	const {type, questions, answers} = decode(msg)
	console.log(type, questions, answers)
}

// const socket = createSocket({type: 'udp4', reuseAddr: true})
// socket.bind(5353, '0.0.0.0', (err) => {
// 	if (err) {
// 		console.error(err)
// 		process.exit(1)
// 	}

// 	console.error('addMembership', MDNSv4_MULTICAST_GROUP)
// 	socket.addMembership(MDNSv4_MULTICAST_GROUP)

// 	console.error('setsockopt', 'socket', SOL_SOCKET, SO_RECV_ANYIF, 1)
// 	setsockopt(socket, SOL_SOCKET, SO_RECV_ANYIF, 1)

// 	socket.on('error', console.error)
// 	socket.on('message', onMessage)
// })

const socket = createSocket({
	type: 'udp6',
	reuseAddr: true,
	ipv6Only: true
})

// socket.setMulticastLoopback(true)
// socket.setMulticastInterface(ip + scope)

socket.bind(5353, (err) => {
// socket.bind(5354, ip + scope, (err) => {
// socket.bind(5353, '::', (err) => {
// socket.bind(5353, '::' + scope, (err) => {
	if (err) {
		console.error(err)
		process.exit(1)
	}
	console.info(socket.address())

	console.error('addMembership', MDNSv6_MULTICAST_GROUP, '::' + scope)
	socket.addMembership(MDNSv6_MULTICAST_GROUP, '::' + scope)
	// console.error('addMembership', MDNSv6_MULTICAST_GROUP, ip + scope)
	// socket.addMembership(MDNSv6_MULTICAST_GROUP, ip + scope)
	// console.error('addMembership', MDNSv6_MULTICAST_GROUP, ip)
	// socket.addMembership(MDNSv6_MULTICAST_GROUP, ip)
	// console.error('addMembership', MDNSv6_MULTICAST_GROUP, '::%en0')
	// socket.addMembership(MDNSv6_MULTICAST_GROUP, '::%en0')
	// console.error('addMembership', MDNSv6_MULTICAST_GROUP)
	// socket.addMembership(MDNSv6_MULTICAST_GROUP)

	console.error('setsockopt', 'socket', SOL_SOCKET, SO_RECV_ANYIF, 1)
	setsockopt(socket, SOL_SOCKET, SO_RECV_ANYIF, 1)

	socket.on('error', console.error)
	socket.on('message', onMessage)
})
