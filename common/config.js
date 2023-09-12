const config = {
	isMac: process.platform === 'darwin',
	isDev: process.env.NODE_ENV !== 'production',
}

exports.config = config;
