import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { checkPaymentEnv } = require('./check-payment-env.cjs');
const names = ['LIGHT', 'STANDARD', 'PRO'].map((plan) => `NEXT_PUBLIC_SQUARE_LINK_${plan}`);

describe('payment environment validation', () => {
  it('requires all three plan links without returning their values', () => {
    const env = Object.fromEntries(names.map((name) => [name, 'https://square.example/pay?private=value']));
    const result = checkPaymentEnv(env);
    expect(result).toHaveLength(3);
    expect(result.every(({ valid }: { valid: boolean }) => valid)).toBe(true);
    expect(JSON.stringify(result)).not.toContain('private=value');
  });

  it('reports the exact missing variable name', () => {
    const result = checkPaymentEnv({ [names[0]]: 'https://square.example/pay' });
    expect(result).toEqual([
      { name: names[0], valid: true, reason: 'configured' },
      { name: names[1], valid: false, reason: 'missing' },
      { name: names[2], valid: false, reason: 'missing' },
    ]);
  });

  it.each(['', ' ', 'not-a-url', 'http://square.example/pay', 'https://user:password@square.example/pay'])(
    'rejects unusable payment links (%s)', (value) => {
      const result = checkPaymentEnv(Object.fromEntries(names.map((name) => [name, value])));
      expect(result.every(({ valid }: { valid: boolean }) => !valid)).toBe(true);
      expect(result.map(({ name }: { name: string }) => name)).toEqual(names);
    }
  );
});
