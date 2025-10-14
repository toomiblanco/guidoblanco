module.exports = {
  apps: [{
    name: 'guidoblanco',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/guidoblanco', // Cambia esto a la ruta real de tu proyecto en el VPS
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
}
