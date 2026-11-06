import { describe, expect, it } from 'vitest';
import { sanitizeEmailHtml } from './mailer';

describe('sanitizeEmailHtml', () => {
  it('keeps trusted email markup and safe links', () => {
    const html = '<p style="color:#ff4500"><a href="https://push-taro.com">確認</a></p>';
    expect(sanitizeEmailHtml(html)).toContain('href="https://push-taro.com"');
    expect(sanitizeEmailHtml(html)).toContain('style="color:#ff4500"');
  });

  it('removes scripts, event handlers, and unsafe links', () => {
    const html = '<p><script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(1)">危険</a></p>';
    const sanitized = sanitizeEmailHtml(html);
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('javascript:');
    expect(sanitized).not.toContain('onclick');
    expect(sanitized).toContain('危険');
  });
});