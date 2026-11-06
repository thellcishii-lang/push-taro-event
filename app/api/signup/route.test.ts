import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  type Data = Record<string, unknown>;
  const documents = new Map<string, Data>();
  const state = { nextId: 0, failCommit: false, transactions: 0 };
  const getUserByEmail = vi.fn();
  const sendEmail = vi.fn();
  const notifyAdmins = vi.fn();
  const enforceRateLimit = vi.fn();
  const createUser = vi.fn();

  function collection(name: string) {
    function query(filters: Array<[string, unknown]> = []) {
      return {
        where(field: string, _operator: string, value: unknown) {
          return query([...filters, [field, value]]);
        },
        limit() { return query(filters); },
        async get() {
          const docs = [...documents.entries()]
            .filter(([path, data]) =>
              path.startsWith(`${name}/`) &&
              filters.every(([field, value]) => data[field] === value))
            .map(([path, data]) => ({ id: path.split('/')[1], data: () => ({ ...data }) }));
          return { docs, empty: docs.length === 0 };
        },
      };
    }
    return {
      ...query(),
      doc(id = `generated-${++state.nextId}`) {
        const path = `${name}/${id}`;
        return {
          id,
          path,
          async get() {
            return { data: () => documents.get(path) };
          },
        };
      },
    };
  }

  function writer() {
    const pending: Array<[string, Data]> = [];
    return {
      create(ref: { path: string }, data: Data) {
        pending.push([ref.path, data]);
      },
      async commit() {
        if (state.failCommit) throw new Error('Firestore commit failed');
        for (const [path] of pending) {
          if (documents.has(path)) throw new Error('Document already exists');
        }
        for (const [path, data] of pending) documents.set(path, { ...data });
      },
    };
  }

  const db = {
    collection: vi.fn(collection),
    batch: vi.fn(writer),
    runTransaction: vi.fn(async (callback: (transaction: ReturnType<typeof writer> & {
      get: (target: { get: () => Promise<unknown> }) => Promise<unknown>;
    }) => Promise<unknown>) => {
      state.transactions++;
      const transaction = { ...writer(), get: (target: { get: () => Promise<unknown> }) => target.get() };
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    }),
  };
  return { documents, state, db, getUserByEmail, createUser, sendEmail, notifyAdmins, enforceRateLimit };
});

vi.mock('../../../lib/firebase-admin', () => ({
  db: mocks.db,
  authAdmin: { getUserByEmail: mocks.getUserByEmail, createUser: mocks.createUser },
}));
vi.mock('../../../lib/mailer', () => ({ sendEmail: mocks.sendEmail }));
vi.mock('../../../lib/error-notifier', () => ({ notifyAdmins: mocks.notifyAdmins }));
vi.mock('../../../lib/rate-limit', () => ({ enforceRateLimit: mocks.enforceRateLimit }));
vi.mock('../../../lib/print-token', () => ({ generatePrintToken: () => 'print-token' }));

import { POST } from './route';

const bankAccount = {
  bankName: 'Bank', branchName: 'Branch', accountType: 'savings',
  accountNumber: '1234567', accountHolder: 'Holder',
};

function signupBody(plan = 'light', referralCode = '') {
  return {
    email: 'SHOP@example.com', companyName: 'Example shop',
    plan, phone: '09000000000', address: 'Example address',
    invoiceNumber: 'T123', referralCode,
    bankAccount: plan === 'pro' ? bankAccount : null,
  };
}

function post(body: object) {
  return POST(new Request('https://push-taro.com/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

function saved(collection: string) {
  return [...mocks.documents.entries()].filter(([path]) => path.startsWith(`${collection}/`));
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  mocks.documents.clear();
  Object.assign(mocks.state, { nextId: 0, failCommit: false, transactions: 0 });
  mocks.enforceRateLimit.mockResolvedValue(null);
  mocks.getUserByEmail.mockRejectedValue(Object.assign(new Error('Not found'), { code: 'auth/user-not-found' }));
  mocks.sendEmail.mockResolvedValue({ success: true });
  mocks.notifyAdmins.mockResolvedValue(undefined);
  for (const plan of ['LIGHT', 'STANDARD', 'PRO']) {
    vi.stubEnv(`NEXT_PUBLIC_SQUARE_LINK_${plan}`, `https://square.example/${plan.toLowerCase()}`);
  }
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://push-taro.com');
});

describe('storefront signup', () => {
  it('checks email availability without creating an account or a shop', async () => {
    const response = await post({ email: 'SHOP@example.com', checkOnly: true });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true });
    expect(mocks.getUserByEmail).toHaveBeenCalledWith('shop@example.com');
    expect(saved('shops')).toHaveLength(0);
    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it.each(['light', 'standard', 'pro'])('accepts the actual %s form and returns its payment link', async (plan) => {
    const response = await post(signupBody(plan));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toMatchObject({ success: true, paymentUrl: `https://square.example/${plan}` });
    const shop = mocks.documents.get(`shops/${data.shopId}`);
    expect(shop).toMatchObject({
      name: 'Example shop', email: 'shop@example.com', plan,
      status: 'pending_payment', referralCode: data.shopId.slice(0, 8).toUpperCase(),
      bankAccount: plan === 'pro' ? bankAccount : null,
    });
    expect(saved('agencies')).toHaveLength(0);
    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'shop@example.com',
      html: expect.stringContaining(`/payment/check?shopId=${data.shopId}`),
    }));
    expect(mocks.sendEmail.mock.calls[0][0].html).toContain(`type=${plan === 'pro' ? 'pro-shop' : 'shop'}`);
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(expect.any(Request), 'signup-shop', 10, 600000);
  });

  it('rejects an existing Auth account without writes', async () => {
    mocks.getUserByEmail.mockResolvedValue({ uid: 'existing' });
    const response = await post(signupBody());
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ alreadyPaid: true });
    expect(saved('shops')).toHaveLength(0);
  });

  it.each(['pending_payment', 'active', 'payment_warning', 'send_disabled'])(
    'rejects a shop with status %s', async (status) => {
      mocks.documents.set('shops/existing', { email: 'shop@example.com', status });
      const response = await post({ email: 'shop@example.com', checkOnly: true });
      expect(response.status).toBe(409);
      expect(saved('shops')).toHaveLength(1);
    }
  );

  it('reports Auth service errors instead of treating them as available email', async () => {
    mocks.getUserByEmail.mockRejectedValue(new Error('Auth unavailable'));
    const response = await post({ email: 'shop@example.com', checkOnly: true });
    expect(response.status).toBe(500);
    expect(mocks.notifyAdmins).toHaveBeenCalled();
    expect(saved('shops')).toHaveLength(0);
  });

  it.each([
    ['invalid plan', { plan: 'invalid' }, 400],
    ['missing company name', { companyName: '' }, 400],
    ['missing PRO bank account', { plan: 'pro', bankAccount: null }, 400],
    ['invalid referral code', { referralCode: 123 }, 400],
  ])('rejects %s before writing', async (_label, overrides, status) => {
    const response = await post({ ...signupBody(), ...overrides });
    expect(response.status).toBe(status);
    expect(saved('shops')).toHaveLength(0);
  });

  it('does not leave a shop when its payment link is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SQUARE_LINK_STANDARD', '');
    const response = await post(signupBody('standard'));
    expect(response.status).toBe(500);
    expect(saved('shops')).toHaveLength(0);
  });

  it.each([
    ['AF-S-CODE', 'affiliates', { rewardType: 'recurring' }, 'affiliate', 0.08, true],
    ['AF-O-CODE', 'affiliates', { rewardType: 'one-time' }, 'affiliate', 0, false],
    ['AGENCY-CODE', 'agencies', {}, 'agency', 0.18, false],
    ['ASHOP-CODE', 'affilishops', {}, 'affilishop', 0.10, true],
    ['PROCODE', 'shops', { plan: 'pro', proReferralPlan: 'a' }, 'pro', 0.10, false],
    ['SHOPCODE', 'shops', { plan: 'light' }, 'shop', 0, false],
  ])('atomically saves the shop and %s referral', async (code, collection, extra, type, rate, tiered) => {
    mocks.documents.set(`${collection}/referrer`, {
      ...extra, status: 'active', referralCode: code, email: 'referrer@example.com',
    });
    const response = await post(signupBody('light', code));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(mocks.documents.get(`shops/${result.shopId}`)).toMatchObject({
      referrerId: 'referrer', referrerType: type, referredByCode: code,
    });
    expect(saved('referral_relations').map(([, data]) => data)).toEqual([
      expect.objectContaining({
        referrerId: 'referrer', referredTenantId: result.shopId,
        referrerType: type, rewardRate: rate, tieredReward: tiered, status: 'pending',
      }),
    ]);
    expect(mocks.db.batch).toHaveBeenCalledOnce();
  });

  it('leaves neither a shop nor a relation on a batch failure', async () => {
    mocks.documents.set('affiliates/referrer', { referralCode: 'AF-S-CODE' });
    mocks.state.failCommit = true;
    const response = await post(signupBody('standard', 'AF-S-CODE'));
    expect(response.status).toBe(500);
    expect(saved('shops')).toHaveLength(0);
    expect(saved('referral_relations')).toHaveLength(0);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.notifyAdmins).toHaveBeenCalled();
  });

  it.each([0, 1, 2])('preserves the PRO B two-slot limit with %i occupied slots', async (occupied) => {
    mocks.documents.set('shops/referrer', {
      referralCode: 'PROCODE', plan: 'pro', proReferralPlan: 'b', email: 'referrer@example.com',
    });
    for (let index = 0; index < occupied; index++) {
      mocks.documents.set(`referral_relations/slot-${index}`, {
        referrerId: 'referrer', referrerType: 'pro', proReferralPlan: 'b',
        status: index === 0 ? 'active' : 'pending',
      });
    }
    const response = await post(signupBody('pro', 'PROCODE'));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(mocks.state.transactions).toBe(1);
    expect(mocks.documents.get(`shops/${result.shopId}`)).toMatchObject({
      referrerId: occupied < 2 ? 'referrer' : null,
      referredByCode: occupied < 2 ? 'PROCODE' : '',
      referrerType: occupied < 2 ? 'pro' : null,
    });
    expect(saved('referral_relations')).toHaveLength(occupied + (occupied < 2 ? 1 : 0));
    if (occupied < 2) {
      expect(saved('referral_relations').at(-1)?.[1]).toMatchObject({ proReferralPlan: 'b', rewardRate: 0.2 });
    } else {
      expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
    }
  });

  it('leaves neither a shop nor a relation when the PRO B transaction fails', async () => {
    mocks.documents.set('shops/referrer', { referralCode: 'PROCODE', plan: 'pro', proReferralPlan: 'b' });
    mocks.state.failCommit = true;
    const response = await post(signupBody('pro', 'PROCODE'));
    expect(response.status).toBe(500);
    expect(saved('shops')).toHaveLength(1);
    expect(saved('referral_relations')).toHaveLength(0);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it('allows a PRO B signup when an old slot has been released', async () => {
    mocks.documents.set('shops/referrer', { referralCode: 'PROCODE', plan: 'pro', proReferralPlan: 'b' });
    mocks.documents.set('referral_relations/active', {
      referrerId: 'referrer', referrerType: 'pro', proReferralPlan: 'b', status: 'active',
    });
    mocks.documents.set('referral_relations/released', {
      referrerId: 'referrer', referrerType: 'pro', proReferralPlan: 'b',
      status: 'pending', slotReleasedAt: new Date(),
    });
    const response = await post(signupBody('pro', 'PROCODE'));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(mocks.documents.get(`shops/${result.shopId}`)).toMatchObject({ referrerId: 'referrer' });
    expect(saved('referral_relations')).toHaveLength(3);
  });

  it('rechecks the PRO referral plan inside the transaction before attaching a relation', async () => {
    mocks.documents.set('shops/referrer', {
      referralCode: 'PROCODE', plan: 'pro', proReferralPlan: 'b', email: 'referrer@example.com',
    });
    const collection = mocks.db.collection.getMockImplementation()!;
    vi.spyOn(mocks.db, 'collection').mockImplementation((name: string) => {
      const result = collection(name);
      if (name !== 'shops') return result;
      const doc = result.doc;
      return {
        ...result,
        doc(id?: string) {
          const ref = doc(id);
          return {
            ...ref,
            async get() {
              return { data: () => ({ ...mocks.documents.get(ref.path), proReferralPlan: 'a' }) };
            },
          };
        },
      };
    });
    const response = await post(signupBody('pro', 'PROCODE'));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(mocks.documents.get(`shops/${result.shopId}`)).toMatchObject({
      referrerId: null, referrerType: null, referredByCode: '',
    });
    expect(saved('referral_relations')).toHaveLength(0);
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('preserves the agency PRO rate', async () => {
    mocks.documents.set('agencies/referrer', { referralCode: 'AGENCY-CODE', status: 'active' });
    const response = await post(signupBody('pro', 'AGENCY-CODE'));
    expect(response.status).toBe(200);
    expect(saved('referral_relations')[0][1]).toMatchObject({ rewardRate: 0.30 });
  });

  it.each(['AF-O-CODE', 'UNKNOWN', 'AGENCY-INACTIVE'])(
    'keeps referral resolution behavior for %s', async (code) => {
      if (code === 'AF-O-CODE') {
        mocks.documents.set('affiliates/referrer', { referralCode: code });
      } else if (code === 'AGENCY-INACTIVE') {
        mocks.documents.set('agencies/referrer', { referralCode: code, status: 'pending_approval' });
      }
      const response = await post(signupBody('standard', code));
      expect(response.status).toBe(200);
      if (code === 'AF-O-CODE') {
        expect(saved('referral_relations')[0][1]).toMatchObject({ rewardType: 'one-time', rewardRate: 0 });
      } else {
        expect(saved('referral_relations')).toHaveLength(0);
      }
    }
  );

  it('does not reserve a PRO B slot for a non-PRO signup', async () => {
    mocks.documents.set('shops/referrer', { referralCode: 'PROCODE', plan: 'pro', proReferralPlan: 'b' });
    const response = await post(signupBody('light', 'PROCODE'));
    expect(response.status).toBe(200);
    expect(saved('referral_relations')).toHaveLength(0);
    expect(mocks.state.transactions).toBe(0);
  });

  it('keeps the saved application and payment link on a reported mail failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.sendEmail.mockResolvedValue({ success: false, error: 'SMTP unavailable' });
    const response = await post(signupBody());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ paymentUrl: 'https://square.example/light' });
    expect(saved('shops')).toHaveLength(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('申込受付メール送信失敗'));
  });
});
