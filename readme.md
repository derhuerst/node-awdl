# awdl

**Send data via [Apple Wireless Direct Link (AWDL)](https://owlink.org/wiki/#what-is-apple-wireless-direct-link-awdl) using JavaScript.**

[![npm version](https://img.shields.io/npm/v/awdl.svg)](https://www.npmjs.com/package/awdl)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/node-awdl.svg)
![minimum Node.js version](https://img.shields.io/node/v/awdl.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)

From the [*Open Wireless Link*](https://owlink.org/), an awesome project that seeks to reverse-engineer AWDL:

> ### What is Apple Wireless Direct Link (AWDL)?
>
> According to [US patent 20180083858A1](https://patents.google.com/patent/US20180083858A1/en), AWDL was designed as a successor to the unsuccessful Wi-Fi IBSS a.k.a. ad hoc mode:
>
>> The limitations of IBSS mode (and its Wi-Fi infrastructure predecessors) led the Wi-Fi Alliance to define Wi-Fi Direct. Further, due to concerns regarding Wi-Fi Direct, Apple Wireless Direct Link (AWDL) was developed by Apple and eventually adopted by the Wi-Fi Alliance as the basis for Neighbor Awareness Networking (NAN).

> ### Which services use AWDL?
>
> We compiled a non-exhaustive list with applications which use [...] AWDL [...].
>
> - AirDrop
> - AirPlay
> - Auto Unlock
> - Universal Clipboard

> ### How does AWDL work?
>
> In technical terms, [we found](https://owlink.org/publications/) that AWDL works essentially works as follow:
>
> In short, each AWDL node announces a sequence of Availability Windows (AWs) indicating its readiness to communicate with other AWDL nodes. An elected master node synchronizes these sequences. Outside the AWs, nodes can tune their Wi-Fi radio to a different channel to communicate with an access point, or could turn it off to save energy.


## Installation

```shell
npm install awdl
```


## Usage

This is a very low-level example, a more practical one will be added soon!

```js
const {isSupported, listenOnAWDL} = require('awdl')
const {decode} = require('dns-packet')

if (isSupported()) {
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
}
```


## API

```js
listenOnAWDL(port, opt = {})
```

Returns a [duplex stream](https://nodejs.org/api/stream.html#stream_class_stream_duplex).

`opt` may have the following fields:
- `udp` – Use UDP instead of TCP? Default: `false`
- `readonly` – Disallow sending data? Will return a [readable stream](https://nodejs.org/api/stream.html#stream_readable_streams) then. Default: `false`
- `recvAnyif` – set [`SO_RECV_ANYIF`]() to receive traffic from all network interfaces? [Apple calls this "unrestricted inbound processing".](https://www.google.com/search?hl=en&q=SO_RECV_ANYIF) Default: `false`


## Contributing

If you have a question or need support using `awdl`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, use [the issues page](https://github.com/derhuerst/node-awdl/issues).
