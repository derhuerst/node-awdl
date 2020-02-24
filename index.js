'use strict'

const {createSocket, Protocol, AddressFamily} = require('raw-socket')

const socket = createSocket({
	addressFamily: AddressFamily.IPv4,
	protocol: Protocol.UDP
})
socket.on('close', () => console.info('socket closed'))
socket.on('error', console.error)
socket.on('message', (msg, addr) => console.info(addr, msg))

// const ffi = require('ffi')
// const libm = ffi.Library('libm', {
// 	ceil: ['double', ['double']]
// })
// console.log(libm.ceil(1.5))

// todo
