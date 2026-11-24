// pm2:  npm i -g pm2 && pm2 start hosting/ecosystem.config.cjs && pm2 save && pm2 startup
module.exports = { apps: [{ name: 'alugridx', script: 'server.js', env: { NODE_ENV: 'production' }, max_memory_restart: '300M' }] };
