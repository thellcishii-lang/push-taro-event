// lib/event-billing.test.ts
// 出店者課金の純粋関数: 設定入力・金額・課金形態の検証、JST 月キーの
// 収支集計、Stripe Webhook イベントからローカルへの効果への変換、
// 終了時の自動解約の対象選定を検証する。
import { describe, expect, it } from 'vitest';
import {
  currentAndPreviousMonthKeys,
  effectFromStripeEvent,
  finalizationCancelTargets,
  isValidStripeSecretKey,
  isValidStripeWebhookSecret,
  monthKeyJst,
  parseBillingAmount,
  parseBillingSettingsInput,
  parseBillingType,
  shopBillingTransitionForSubscriptionStatus,
  summarizePaymentsByMonth,
  type ShopBilling,
  type StripeWebhookEventLike,
} from './event-billing';

function stripeEvent(
  type: string,
  object: Record<string, unknown>,
  created = 1_762_000_000,
): StripeWebhookEventLike {
  return { id: `evt_${type}`, type, created, data: { object } };
}

describe('Stripe キーの形式チェック', () => {
  it('シークレットキーは sk_/rk_ の test/live を受け付ける', () => {
    expect(isValidStripeSecretKey('sk_live_abcdefghijklmnop')).toBe(true);
    expect(isValidStripeSecretKey('sk_test_abcdefghijklmnop')).toBe(true);
    expect(isValidStripeSecretKey('rk_live_abcdefghijklmnop')).toBe(true);
    expect(isValidStripeSecretKey('pk_live_abcdefghijklmnop')).toBe(false);
    expect(isValidStripeSecretKey('sk_live_short')).toBe(false);
    expect(isValidStripeSecretKey('')).toBe(false);
    expect(isValidStripeSecretKey(123)).toBe(false);
  });

  it('Webhook シークレットは whsec_ で始まるものだけ', () => {
    expect(isValidStripeWebhookSecret('whsec_abcdefghijklmnop')).toBe(true);
    expect(isValidStripeWebhookSecret('whsec_x')).toBe(false);
    expect(isValidStripeWebhookSecret('sk_live_abcdefghijklmnop')).toBe(false);
  });
});

describe('parseBillingSettingsInput', () => {
  it('片方だけの保存ができる（未指定は維持）', () => {
    const result = parseBillingSettingsInput({
      secretKey: 'sk_live_abcdefghijklmnop',
    });
    expect(result).toEqual({
      ok: true,
      value: { secretKey: 'sk_live_abcdefghijklmnop' },
    });
  });

  it('両方指定もでき、値は trim される', () => {
    const result = parseBillingSettingsInput({
      secretKey: '  sk_test_abcdefghijklmnop ',
      webhookSecret: 'whsec_abcdefghijklmnop',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.secretKey).toBe('sk_test_abcdefghijklmnop');
      expect(result.value.webhookSecret).toBe('whsec_abcdefghijklmnop');
    }
  });

  it('形式が不正なキーはエラー', () => {
    expect(parseBillingSettingsInput({ secretKey: 'abc' }).ok).toBe(false);
    expect(parseBillingSettingsInput({ webhookSecret: 'abc' }).ok).toBe(false);
  });

  it('何も無ければエラー、非オブジェクトもエラー', () => {
    expect(parseBillingSettingsInput({}).ok).toBe(false);
    expect(parseBillingSettingsInput(null).ok).toBe(false);
    expect(parseBillingSettingsInput('x').ok).toBe(false);
  });
});

describe('parseBillingAmount', () => {
  it('円の整数を受け付ける', () => {
    expect(parseBillingAmount(3000)).toEqual({ ok: true, value: 3000 });
    expect(parseBillingAmount(50)).toEqual({ ok: true, value: 50 });
  });

  it('範囲外・小数・文字列はエラー', () => {
    expect(parseBillingAmount(49).ok).toBe(false);
    expect(parseBillingAmount(10_000_001).ok).toBe(false);
    expect(parseBillingAmount(3000.5).ok).toBe(false);
    expect(parseBillingAmount('3000').ok).toBe(false);
    expect(parseBillingAmount(undefined).ok).toBe(false);
  });
});

describe('parseBillingType', () => {
  it('未指定は subscription（従来形）', () => {
    expect(parseBillingType(undefined)).toEqual({ ok: true, value: 'subscription' });
    expect(parseBillingType('subscription')).toEqual({ ok: true, value: 'subscription' });
  });

  it('one-time を受け付ける', () => {
    expect(parseBillingType('one-time')).toEqual({ ok: true, value: 'one-time' });
  });

  it('それ以外の値はエラー', () => {
    expect(parseBillingType('monthly').ok).toBe(false);
    expect(parseBillingType(null).ok).toBe(false);
    expect(parseBillingType(1).ok).toBe(false);
  });
});

describe('JST 月キーと収支集計', () => {
  it('monthKeyJst は JST で月を判定する（UTC 10月末は JST 11月）', () => {
    expect(monthKeyJst('2026-10-31T16:00:00.000Z')).toBe('2026-11');
    expect(monthKeyJst('2026-11-01T00:00:00.000Z')).toBe('2026-11');
    expect(monthKeyJst('garbage')).toBe('');
  });

  it('currentAndPreviousMonthKeys は年をまたいでも正しい', () => {
    expect(currentAndPreviousMonthKeys(new Date('2026-01-15T00:00:00.000Z'))).toEqual({
      current: '2026-01',
      previous: '2025-12',
    });
    // UTC では 2025-12-31 でも JST では 2026-01-01
    expect(currentAndPreviousMonthKeys(new Date('2025-12-31T16:00:00.000Z'))).toEqual({
      current: '2026-01',
      previous: '2025-12',
    });
  });

  it('summarizePaymentsByMonth は paid だけを今月・先月で合計する', () => {
    const now = new Date('2026-11-14T03:00:00.000Z'); // JST 2026-11-14
    const summary = summarizePaymentsByMonth(
      [
        { amount: 3000, status: 'paid', paidAt: '2026-11-02T01:00:00.000Z', occurredAt: '2026-11-02T01:00:00.000Z' },
        // UTC 10/31 16:00 = JST 11/1 → 今月
        { amount: 2000, status: 'paid', paidAt: '2026-10-31T16:00:00.000Z', occurredAt: '2026-10-31T16:00:00.000Z' },
        { amount: 4000, status: 'paid', paidAt: '2026-10-10T01:00:00.000Z', occurredAt: '2026-10-10T01:00:00.000Z' },
        // 失敗は数えない
        { amount: 9000, status: 'failed', paidAt: null, occurredAt: '2026-11-05T00:00:00.000Z' },
        // 先々月は数えない
        { amount: 7000, status: 'paid', paidAt: '2026-09-30T01:00:00.000Z', occurredAt: '2026-09-30T01:00:00.000Z' },
      ],
      now,
    );
    expect(summary).toEqual({
      currentMonthKey: '2026-11',
      currentMonthTotal: 5000,
      previousMonthKey: '2026-10',
      previousMonthTotal: 4000,
    });
  });
});

describe('shopBillingTransitionForSubscriptionStatus', () => {
  it('状態ごとの遷移と掲載への効果', () => {
    expect(shopBillingTransitionForSubscriptionStatus('active')).toEqual({
      status: 'active',
      suspend: false,
    });
    expect(shopBillingTransitionForSubscriptionStatus('past_due')).toEqual({
      status: 'past_due',
      suspend: null,
    });
    expect(shopBillingTransitionForSubscriptionStatus('unpaid')).toEqual({
      status: 'suspended',
      suspend: true,
    });
    expect(shopBillingTransitionForSubscriptionStatus('canceled')).toEqual({
      status: 'canceled',
      suspend: true,
    });
    expect(shopBillingTransitionForSubscriptionStatus('incomplete')).toEqual({
      status: 'none',
      suspend: null,
    });
    expect(shopBillingTransitionForSubscriptionStatus('unknown')).toBeNull();
  });
});

describe('effectFromStripeEvent', () => {
  it('checkout.session.completed（subscription）で ID を紐づける', () => {
    const effect = effectFromStripeEvent(
      stripeEvent('checkout.session.completed', {
        mode: 'subscription',
        subscription: 'sub_1',
        customer: 'cus_1',
        metadata: { eventId: 'event-1', exhibitorId: 'shop-1' },
      }),
    );
    expect(effect).toMatchObject({
      subscriptionId: 'sub_1',
      customerId: 'cus_1',
      paymentIntentId: null,
      metadataEventId: 'event-1',
      metadataExhibitorId: 'shop-1',
      billingPatch: { stripeSubscriptionId: 'sub_1', stripeCustomerId: 'cus_1' },
      suspend: null,
      payment: null,
      oneTimeOnly: false,
    });
  });

  it('checkout.session.completed（一括・支払い確定）で paid 化＋支払い記録＋復旧', () => {
    const effect = effectFromStripeEvent(
      stripeEvent('checkout.session.completed', {
        mode: 'payment',
        payment_status: 'paid',
        amount_total: 8000,
        payment_intent: 'pi_1',
        customer: 'cus_1',
        metadata: { eventId: 'event-1', exhibitorId: 'shop-1' },
      }),
    );
    expect(effect).toMatchObject({
      subscriptionId: null,
      customerId: 'cus_1',
      paymentIntentId: 'pi_1',
      metadataEventId: 'event-1',
      metadataExhibitorId: 'shop-1',
      suspend: false,
      oneTimeOnly: false,
    });
    expect(effect?.billingPatch.status).toBe('paid');
    expect(effect?.billingPatch.stripePaymentIntentId).toBe('pi_1');
    expect(effect?.payment).toEqual({
      amount: 8000,
      status: 'paid',
      invoiceId: null,
      paidAt: new Date(1_762_000_000 * 1000).toISOString(),
    });
  });

  it('checkout.session.completed（一括・支払い未確定）は ID 紐づけだけで状態を動かさない', () => {
    const effect = effectFromStripeEvent(
      stripeEvent('checkout.session.completed', {
        mode: 'payment',
        payment_status: 'unpaid',
        amount_total: 8000,
        payment_intent: 'pi_2',
        customer: 'cus_1',
        metadata: { eventId: 'event-1', exhibitorId: 'shop-1' },
      }),
    );
    expect(effect?.billingPatch.status).toBeUndefined();
    expect(effect?.billingPatch.stripePaymentIntentId).toBe('pi_2');
    expect(effect?.suspend).toBeNull();
    expect(effect?.payment).toBeNull();
  });

  it('checkout.session.completed の対象外モード（setup）は null', () => {
    expect(
      effectFromStripeEvent(
        stripeEvent('checkout.session.completed', { mode: 'setup' }),
      ),
    ).toBeNull();
  });

  it('charge.refunded（全額返金）は一括払い限定の掲載停止', () => {
    const effect = effectFromStripeEvent(
      stripeEvent('charge.refunded', {
        id: 'ch_1',
        payment_intent: 'pi_1',
        customer: 'cus_1',
        refunded: true,
        amount: 8000,
        amount_refunded: 8000,
      }),
    );
    expect(effect).toMatchObject({
      paymentIntentId: 'pi_1',
      billingPatch: { status: 'suspended' },
      suspend: true,
      payment: null,
      oneTimeOnly: true,
    });
  });

  it('charge.refunded（部分返金）は対象外', () => {
    expect(
      effectFromStripeEvent(
        stripeEvent('charge.refunded', {
          id: 'ch_1',
          payment_intent: 'pi_1',
          refunded: false,
          amount: 8000,
          amount_refunded: 1000,
        }),
      ),
    ).toBeNull();
  });

  it('invoice.paid（旧形式）で active 化＋支払い記録＋復旧', () => {
    const effect = effectFromStripeEvent(
      stripeEvent('invoice.paid', {
        id: 'in_1',
        subscription: 'sub_1',
        customer: 'cus_1',
        amount_paid: 3000,
        status_transitions: { paid_at: 1_762_000_000 },
        lines: { data: [{ period: { end: 1_765_000_000 } }] },
      }),
    );
    expect(effect?.billingPatch.status).toBe('active');
    expect(effect?.billingPatch.currentPeriodEnd).toBe(
      new Date(1_765_000_000 * 1000).toISOString(),
    );
    expect(effect?.suspend).toBe(false);
    expect(effect?.payment).toEqual({
      amount: 3000,
      status: 'paid',
      invoiceId: 'in_1',
      paidAt: new Date(1_762_000_000 * 1000).toISOString(),
    });
    expect(effect?.subscriptionId).toBe('sub_1');
  });

  it('invoice.paid（現行形式: parent.subscription_details）でも引ける', () => {
    const effect = effectFromStripeEvent(
      stripeEvent('invoice.paid', {
        id: 'in_2',
        parent: {
          subscription_details: {
            subscription: 'sub_2',
            metadata: { eventId: 'event-9', exhibitorId: 'shop-9' },
          },
        },
        customer: 'cus_2',
        amount_paid: 5000,
      }),
    );
    expect(effect?.subscriptionId).toBe('sub_2');
    expect(effect?.metadataEventId).toBe('event-9');
    expect(effect?.metadataExhibitorId).toBe('shop-9');
    expect(effect?.payment?.amount).toBe(5000);
  });

  it('invoice.payment_failed は past_due にし、停止はまだしない', () => {
    const effect = effectFromStripeEvent(
      stripeEvent('invoice.payment_failed', {
        id: 'in_3',
        subscription: 'sub_1',
        customer: 'cus_1',
        amount_due: 3000,
      }),
    );
    expect(effect?.billingPatch.status).toBe('past_due');
    expect(effect?.suspend).toBeNull();
    expect(effect?.payment).toMatchObject({ amount: 3000, status: 'failed', invoiceId: 'in_3', paidAt: null });
  });

  it('customer.subscription.updated の unpaid で掲載停止', () => {
    const effect = effectFromStripeEvent(
      stripeEvent('customer.subscription.updated', {
        id: 'sub_1',
        customer: 'cus_1',
        status: 'unpaid',
        metadata: { eventId: 'event-1', exhibitorId: 'shop-1' },
      }),
    );
    expect(effect?.billingPatch.status).toBe('suspended');
    expect(effect?.suspend).toBe(true);
  });

  it('customer.subscription.updated の past_due は停止しない', () => {
    const effect = effectFromStripeEvent(
      stripeEvent('customer.subscription.updated', {
        id: 'sub_1',
        customer: 'cus_1',
        status: 'past_due',
      }),
    );
    expect(effect?.billingPatch.status).toBe('past_due');
    expect(effect?.suspend).toBeNull();
  });

  it('期間終了は items 形式（現行）からも読む', () => {
    const effect = effectFromStripeEvent(
      stripeEvent('customer.subscription.updated', {
        id: 'sub_1',
        customer: 'cus_1',
        status: 'active',
        items: { data: [{ current_period_end: 1_765_000_000 }] },
      }),
    );
    expect(effect?.billingPatch.currentPeriodEnd).toBe(
      new Date(1_765_000_000 * 1000).toISOString(),
    );
    expect(effect?.suspend).toBe(false);
  });

  it('customer.subscription.deleted は canceled＋掲載停止', () => {
    const effect = effectFromStripeEvent(
      stripeEvent('customer.subscription.deleted', {
        id: 'sub_1',
        customer: 'cus_1',
        status: 'canceled',
      }),
    );
    expect(effect?.billingPatch.status).toBe('canceled');
    expect(effect?.suspend).toBe(true);
  });

  it('対象外のイベント種別は null', () => {
    expect(
      effectFromStripeEvent(stripeEvent('payment_intent.succeeded', { id: 'pi_1' })),
    ).toBeNull();
    expect(
      effectFromStripeEvent(
        stripeEvent('customer.subscription.updated', {
          id: 'sub_1',
          status: 'something_new',
        }),
      ),
    ).toBeNull();
  });
});

describe('finalizationCancelTargets（終了時の自動解約の対象選定）', () => {
  const base: ShopBilling = {
    exhibitorId: 'shop-1',
    billingType: 'subscription',
    stripeCustomerId: 'cus_1',
    stripeSubscriptionId: 'sub_1',
    stripePaymentIntentId: null,
    amount: 3000,
    status: 'active',
    currentPeriodEnd: null,
    checkoutUrl: null,
    checkoutSessionId: null,
    canceledByAdmin: false,
    updatedAt: '',
  };

  it('月額サブスクで解約されていないものだけが対象', () => {
    const targets = finalizationCancelTargets([
      base,
      { ...base, exhibitorId: 'shop-2', status: 'past_due', stripeSubscriptionId: 'sub_2' },
      { ...base, exhibitorId: 'shop-3', status: 'suspended', stripeSubscriptionId: 'sub_3' },
    ]);
    expect(targets.map((t) => t.exhibitorId)).toEqual(['shop-1', 'shop-2', 'shop-3']);
  });

  it('一括払い・解約済み・サブスク未作成は対象外', () => {
    const targets = finalizationCancelTargets([
      { ...base, exhibitorId: 'one-time', billingType: 'one-time', status: 'paid', stripeSubscriptionId: null, stripePaymentIntentId: 'pi_1' },
      { ...base, exhibitorId: 'canceled', status: 'canceled' },
      { ...base, exhibitorId: 'not-started', status: 'none', stripeSubscriptionId: null },
    ]);
    expect(targets).toEqual([]);
  });
});
