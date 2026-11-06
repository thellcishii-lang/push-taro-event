const { loadEnvConfig } = require('@next/env');

function checkPaymentEnv(env) {
  const names = [
    'NEXT_PUBLIC_SQUARE_LINK_LIGHT',
    'NEXT_PUBLIC_SQUARE_LINK_STANDARD',
    'NEXT_PUBLIC_SQUARE_LINK_PRO',
  ];
  return names.map((name) => {
    const value = env[name]?.trim();
    if (!value) return { name, valid: false, reason: 'missing' };
    try {
      const url = new URL(value);
      const valid = url.protocol === 'https:' && !url.username && !url.password;
      return { name, valid, reason: valid ? 'configured' : 'HTTPS URL required' };
    } catch {
      return { name, valid: false, reason: 'invalid URL' };
    }
  });
}

if (require.main === module) {
  loadEnvConfig(process.cwd());
  const results = checkPaymentEnv(process.env);
  for (const { name, valid, reason } of results) {
    console.log(`[payment-env] ${name}: ${valid ? 'OK' : 'ERROR'} (${reason})`);
  }
  if (results.some(({ valid }) => !valid)) process.exitCode = 1;
}

module.exports = { checkPaymentEnv };
