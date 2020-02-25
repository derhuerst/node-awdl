'use strict'

const {platform, networkInterfaces} = require('os')
const {exec} = require('child_process')
const duplexify = require('duplexify')

const isSupported = () => {
	// see https://github.com/derhuerst/node-awdl/issues/2
	if (platform() !== 'darwin') return false
	const {awdl0} = networkInterfaces()
	if (!Array.isArray(awdl0) || !awdl0[0]) return false
	return awdl0[0].family === 'IPv6'
}

const listenOnAWDL = (port, opt = {}) => {
	if (!Number.isInteger(port)) throw new Error('port must be an integer')
	opt = {
		udp: false, // Use UDP instead of TCP?
		readonly: false, // Disallow sending data?
		// Set SO_RECV_ANYIF to receive traffic from all interfaces?
		recvAnyif: false,
		...opt
	}

	const call = [
		'nc', // netcat
		'-b', 'awdl0', // use the `awdl0` network interface
		'-6', // IPv6
		'-l', port + '',
	]
	if (opt.udp) call.push('-u')
	if (opt.readonly) call.push('-d')
	if (opt.recvAnyif) call.push('-A')

	const onExit = (err, stderr) => {
		stream.removeListener('close', exitOnClose)

		if (!err) {
			stream.destroy()
			return
		}

		const text = err ? err.message : (err + '')
		const msg = text.split('\n')[0]
		const error = new Error('failed to listen on the AWDL interface: ' + msg)
		error.spawnError = err
		error.stderr = stderr
		stream.destroy(error)
	}

	const proc = exec(call.join(' '), {encoding: 'buffer'}, onExit)
	const exitOnClose = () => {
		proc.kill('SIGKILL') // let child process exit immediately
	}

	const stream = opt.readonly
		? proc.stdout
		: duplexify(proc.stdin, proc.stdout, {
			// If the process exits with an error, `proc.stdin` and/or
			// `proc.stdout` are being `destroy()`ed *without* an `Error`.
			// In order to `destroy()` our duplex stream with an appropriate
			// `Error`, we do that manually.
			autoDestroy: false
		})
	stream.once('close', exitOnClose)

	return stream
}

module.exports = {
	isSupported,
	listenOnAWDL,
}
