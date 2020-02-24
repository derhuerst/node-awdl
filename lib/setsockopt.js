const {DynamicLibrary, ForeignFunction} = require('ffi')
const ref = require('ref')

const _setsockopt = ForeignFunction(
	new DynamicLibrary().get('setsockopt'),
	ref.types.int,
	[
		ref.types.int,
		ref.types.int,
		ref.types.int,
		ref.refType(ref.types.void),
		ref.refType(ref.types.int)
	]
)

const setsockopt = (socket, level, option, value) => {
	const fd = socket._handle.fd
	if (!Number.isInteger(fd)) throw new Error('invalid socket?')
	if (!Number.isInteger(level)) throw new Error('invalid level')
	if (!Number.isInteger(option)) throw new Error('invalid option')
	if (!Number.isInteger(value)) throw new Error('invalid value')

	const status = _setsockopt(
		fd,
		level,
		option,
		ref.alloc(ref.types.int, value),
		ref.alloc(ref.types.int, ref.types.int.size)
	)
	if (status !== 0) {
		const err = ('setsockopt failed with ' + status)
		err.status = status
		err.level = level
		err.option = option
	}
}

module.exports = setsockopt
