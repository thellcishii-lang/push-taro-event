import { describe, expect, it } from 'vitest';
import { shouldBlockForPasswordChange } from './organizers';

describe('shouldBlockForPasswordChange', () => {
  it('レコードが無いユーザー（運営等）はブロックしない', () => {
    expect(shouldBlockForPasswordChange(null)).toBe(false);
  });
  it('mustChangePassword が立っていればブロックする', () => {
    expect(shouldBlockForPasswordChange({ mustChangePassword: true })).toBe(true);
  });
  it('mustChangePassword が下りていればブロックしない', () => {
    expect(shouldBlockForPasswordChange({ mustChangePassword: false })).toBe(false);
  });
});
