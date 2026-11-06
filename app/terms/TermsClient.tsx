// app/terms/TermsClient.tsx
'use client';

import Link from 'next/link';

export default function TermsClient() {
  return (
    <main style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#2d3748', background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', lineHeight: '1.8' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        
        <p style={{ marginBottom: '20px' }}>
          <Link href="/" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: 'bold' }}>← トップページに戻る</Link>
        </p>
        
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: '#1a202c', borderBottom: '3px solid #3182ce', paddingBottom: '10px' }}>
          利用規約
        </h1>
        
        <p style={{ marginBottom: '24px', fontSize: '14px', color: '#4a5568' }}>
          この利用規約（以下、「本規約」といいます。）は、the合同会社（以下、「当社」といいます。）が提供するPush-taro（以下、「当サービス」といいます。）の利用条件を定めるものです。ご利用者様（以下、「ユーザー」といいます。）には、本規約に従って当サービスをご利用いただきます。
        </p>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第1条（適用）</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            本規約は、ユーザーと当社との間の当サービスの利用に関わる一切の関係に適用されるものとします。ユーザーが本サービスのお申し込みまたはご利用を開始した時点で、本規約の全条項に同意したものとみなします。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第2条（アカウント登録と管理）</h2>
          <ol style={{ fontSize: '14px', color: '#4a5568', paddingLeft: '20px' }}>
            <li>ユーザーは、真実かつ正確な情報をもってアカウント登録を行うものとします。登録内容に変更が生じた場合、速やかに変更手続きを行う必要があります。</li>
            <li>ユーザーは、自己の責任においてアカウントIDおよびパスワードを厳重に管理するものとし、第三者への譲渡・貸与・売買等はできません。</li>
            <li>アカウント情報の管理不十分による損害の責任はユーザーが負うものとします。</li>
          </ol>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第3条（利用料金および支払い方法）</h2>
          <ol style={{ fontSize: '14px', color: '#4a5568', paddingLeft: '20px' }}>
            <li>ユーザーは、当サービスが定める各プラン（ライトプラン: 1,980円/月、スタンダードプラン: 3,800円/月、プロプラン: 10,000円/月、いずれも税別）の利用料金を、当社指定の決済手段（Square等）により支払うものとします。</li>
            <li>月の途中でアカウントの開通または解約が行われた場合であっても、日割り計算による返金・精算は行いません。</li>
            <li>ユーザーが利用料金の支払いを遅延した場合、年14.6%の割合による遅延損害金を支払うものとします。</li>
          </ol>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第4条（送信メッセージおよびコンテンツの責任）</h2>
          <ol style={{ fontSize: '14px', color: '#4a5568', paddingLeft: '20px' }}>
            <li>当サービスを通じてエンドユーザー（通知購読者）へ配信されるメッセージの内容（テキスト、画像、URL等）に関する責任は、一切ユーザー自身に帰属します。</li>
            <li>ユーザーは、特定電子メール法等の関連法令、消費者庁ガイドラインおよびプライバシー関連法規を遵守し、承諾を得ていない不特定多数への迷惑通知（スパム配信）を行ってはなりません。</li>
          </ol>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第5条（禁止事項）</h2>
          <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '8px' }}>ユーザーは、当サービスの利用にあたり、以下の行為を行ってはならないものとします。</p>
          <ul style={{ fontSize: '14px', color: '#4a5568', paddingLeft: '20px' }}>
            <li>法令または公序良俗に違反する行為、あるいは犯罪行為に関連する行為</li>
            <li>当サービス、他のユーザー、または第三者の知的財産権、名誉、プライバシーを侵害する行為</li>
            <li>当サービスのサーバーやネットワークに過度な負荷をかける行為、リバースエンジニアリング等の解析行為</li>
            <li>虚偽の情報または第三者の情報を騙って配信を行う行為</li>
            <li>反社会的勢力への利益供与行為</li>
          </ul>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第6条（サービスの提供停止・変更・終了）</h2>
          <ol style={{ fontSize: '14px', color: '#4a5568', paddingLeft: '20px' }}>
            <li>当社は、システムの定期保守・障害復旧・天災地変等の不可抗力により、事前に通知することなくサービスの全部または一部の提供を中断・停止することがあります。</li>
            <li>当社は、事前にお客様へ通知（Webサイト上での告知等）を行うことにより、当サービスの内容を変更し、または提供を終了することができるものとします。</li>
          </ol>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第7条（紹介成果報酬制度・PRO特典）</h2>
          <ol style={{ fontSize: '14px', color: '#4a5568', paddingLeft: '20px' }}>
            <li>プロプランをご契約のユーザーが他店舗を紹介した場合、所定のロジックに基づき10%相当の成果報酬権利が発生します。</li>
            <li>発生した成果報酬は、原則として毎月の請求精算時における自動控除・相殺にて精算されます。</li>
            <li>不正な自己紹介、虚偽アカウントの作成、その他不当な方法による成果報酬の発生が発覚した場合、当社は即時に報酬支払いを取消し、アカウントを停止することができます。</li>
          </ol>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第8条（契約解除および利用制限）</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            ユーザーが本規約のいずれかの条項に違反した場合、または利用料金の支払いを怠った場合、当社は事前の催告なく即座にサービス利用の停止、あるいは契約を解除することができます。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第9条（免責事項）</h2>
          <ol style={{ fontSize: '14px', color: '#4a5568', paddingLeft: '20px' }}>
            <li>当社は、当サービスがユーザーの特定の目的に適合すること、期待する成果（集客数・売上向上等）が得られることを保証するものではありません。</li>
            <li>ブラウザ端末（iOS/Android/Chrome等）の仕様変更、通信事業者の障害等によりプッシュ通知が正常に不着となった場合、当社はそれにより生じた損害について責任を負いません。</li>
            <li>当社が損害賠償責任を負う場合であっても、過去1ヶ月間にユーザーが支払った利用料相当額を上限とします。</li>
          </ol>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第10条（秘密保持および個人情報の取扱い）</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            ユーザーおよび当社は、本サービスの提供・利用に関して知り得た相手方の非公表の情報を秘密に保持するものとします。個人情報の取扱いについては、別途定める「プライバシーポリシー」に従うものとします。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第11条（規約の変更）</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            当社は、必要と判断した場合には、ユーザーに事前に適切な方法（Webサイト上の掲示等）で通知することにより、いつでも本規約を変更することができるものとします。変更後の規約は掲載された時点で効力を生じます。
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>第12条（準拠法および裁判管轄）</h2>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            本規約の解釈にあたっては、日本法を準拠法とします。当サービスに関して紛争が生じた場合、当社の本社所在地を管轄する裁判所を専属的合意管轄とします。
          </p>
        </section>

        {/* 運営事業者情報 */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '13px', color: '#718096' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', color: '#2d3748' }}>【サービス運営事業者】</p>
          <p style={{ margin: '0 0 2px 0' }}>事業者名：the合同会社</p>
          <p style={{ margin: '0 0 2px 0' }}>所在地：〒357-0123 埼玉県飯能市中藤下郷２３−２１</p>
          <p style={{ margin: 0 }}>お問い合わせ：info@push-taro.com</p>
        </div>

      </div>
    </main>
  );
}
