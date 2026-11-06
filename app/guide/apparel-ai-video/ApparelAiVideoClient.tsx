'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import '../industry.css';

export default function ApparelAiVideoClient() {
return (
<>
<nav className="g-nav">
<div className="g-nav-inner">
<BrandLogo />
<Link href="/signup" className="g-nav-cta">今すぐ申し込む →</Link>
</div>
</nav>

<main className="g-main">
<div className="g-breadcrumb">
<Link href="/guide">ガイド</Link>
<span className="sep">/</span>
<span className="current">AI着用動画の作り方</span>
</div>

<div className="g-hero">
<span className="g-badge">🎬 アパレル向けAI活用</span>
<h1>マネキンの写真1枚で、<br />着用動画の作り方</h1>
<p>
モデル撮影は、要りません。<br />
マネキンに着せた<strong>写真1枚</strong>と、AIへの<strong>一言</strong>で、<br />
「着て、歩いて、回る」着用イメージ動画が作れます。<br />
Push-taro公式Instagramで実際に公開した作例で、手順を全部見せます。
</p>
</div>

<div className="g-content">

<img
className="g-img is-narrow"
src="/guide/apparel-ai-video/%20wearing.jpeg"
alt="マネキンの写真からAIで生成した、ワンピースの着用イメージ（ワンショット）"
/>
<p className="g-img-cap">完成形が、こちら。マネキンの静止画から、AIが生成した着用イメージです（実際の動画は、この記事のリンク先リールで見られます）</p>

{/* ============================================================
1. 用意するのは、マネキンの写真1枚
============================================================ */}
<h2><span className="num">1</span>用意するのは、マネキンの写真1枚</h2>

<p>
撮影は、ふだんの店頭作業のついででOKです。<br />
お店のマネキン（トルソー）に新作を着せて、<strong>スマホで1枚撮る</strong>。<br />
用意するのは、本当にこれだけです。
</p>

<img
className="g-img is-narrow"
src="/guide/apparel-ai-video/mannequin.jpeg"
alt="ワンピースを着せたマネキン（トルソー）の写真"
/>
<p className="g-img-cap">起点はこの1枚。今回の作例で実際に使った、マネキンの着せ付け写真です</p>

<p>
ハンガーにかけた状態でも構いません。<br />
大事なのは、<strong>商品の柄や形が、はっきり写っていること</strong>。<br />
AIは、この写真をもとに「人が着たらどう見えるか」を描きます。
</p>

{/* ============================================================
2. Muse に渡して、頼むだけ
============================================================ */}
<h2><span className="num">2</span>Muse に渡して、頼むだけ</h2>

<p>
動画作りは、AIアシスタントの<strong>「Muse」</strong>に任せます。<br />
動画編集ソフトも、専門知識も要りません。
</p>

<div className="g-steps">
<div className="g-step">
<div className="g-step-body">
<h4>① まずは、Muse をインストール</h4>
<p>スマホに Muse アプリを入れて、サインインします。準備はこれだけです。</p>
</div>
</div>
<div className="g-step">
<div className="g-step-body">
<h4>② Instagram と Muse を連携する</h4>
<p>連携しておけば、作った動画をそのまま Instagram に投稿するところまで、Muse に任せられます。</p>
</div>
</div>
<div className="g-step">
<div className="g-step-body">
<h4>③ マネキンの写真を渡して、プロンプトを添える</h4>
<p>写真と一緒に「どう動かしたいか」を一言で伝えます。実際に使った文章は、この下に全文を載せました。</p>
</div>
</div>
<div className="g-step">
<div className="g-step-body">
<h4>④ 返ってきた動画を、リールに投稿</h4>
<p>歩く・回る・BGMまで付いた、約10秒の動画が返ってきます。あとは投稿するだけです。</p>
</div>
</div>
</div>

<div className="g-callout info">
<span className="ico">💡</span>
<div>
<p><strong>実際に使ったプロンプトは、これだけ</strong></p>
<p>
「このマネキンのワンピース写真から、リール用の着用動画を作って。同じお店の中で、女性が着てゆっくり歩く感じで、スカートの揺れを見せて。途中で1回回って後ろ姿も。BGMも軽くつけて。」
</p>
</div>
</div>

<div className="g-callout success">
<span className="ico">🎬</span>
<div>
<p><strong>実際のリール動画は、こちらから確認できます</strong></p>
<p>
静止画が、どう動いたか。<br />
Push-taro公式Instagramのリールで公開中です。<br />
<a href="https://www.instagram.com/reel/DfUYkvJj25X/" target="_blank" rel="noopener noreferrer">▶︎ リールを見る（Instagram）</a>
</p>
</div>
</div>

<p>
ポイントは、<strong>バズる動画を目指さない</strong>ことです。<br />
お客様が欲しいのは、派手な映像ではなく、<strong>「実際に着て、動いたらどう見えるか」</strong>。<br />
揺れ感、丈感、後ろ姿——静止画では伝わらない情報が、購入の後押しになります。
</p>

{/* ============================================================
3. 仕上げは、プッシュ通知で「届ける」
============================================================ */}
<h2><span className="num">3</span>仕上げは、プッシュ通知で「届ける」</h2>

<p>
動画をSNSに投稿したら、終わりではありません。<br />
フィードは流れていくので、<strong>フォロワーが必ず見てくれるとは限らない</strong>。<br />
見逃しをなくす決め手が、プッシュ通知です。
</p>

<p>
SNSは「見せる場所」、プッシュ通知は「届ける仕組み」。<br />
役割を分けるのが、アパレルの告知の型です。
</p>

<div className="g-callout success">
<span className="ico">📢</span>
<div>
<p><strong>配信例</strong></p>
<p>
「<br />
花柄のフレアワンピースが、入荷しました👗<br /><br />
動いたときの揺れ感は、リールの動画でチェックできます。<br />
是非、実物を見に来てくださいね！」
</p>
</div>
</div>

<p>
あわせて、<strong>クーポンは「静かに載せる」</strong>のがコツです。<br />
クーポンを設定しておけば、お客様が開いたときに、画面に付いている状態になります。<br />
通知は本当に知らせたい時だけ、クーポンは常時ひっそり。<br />
この使い分けで、<strong>うるさくならない告知</strong>ができます。
</p>

<div className="g-callout info">
<span className="ico">💡</span>
<div>
<p><strong>動画は、AI生成の「着用イメージ」です</strong></p>
<p>
実物の色味や生地感とは、多少異なる場合があります。<br />
「実物は、店頭でご確認ください」という前提で使うのが、おすすめです。
</p>
</div>
</div>

<div className="g-quote is-orange">
撮影は、写真1枚。<br />
動画は、AIに一言。<br />
あとは、プッシュ通知で届けるだけ。
</div>

{/* ============================================================
関連ガイド
============================================================ */}
<div className="g-related">
<h3>次に読む</h3>
<div className="g-related-grid">
<Link href="/guide/apparel" className="g-related-card is-next">
<span className="ico">👕</span>
<div>
<div className="title">アパレル・雑貨店のための活用ガイド</div>
<div className="sub">新作・セール・限定アイテムを、ビジュアルで届ける</div>
</div>
<span className="arrow">→</span>
</Link>
</div>
</div>

{/* ============================================================
CTA
============================================================ */}
<div className="g-cta">
<h3>新作の「着用イメージ」を、お客様に届けよう。</h3>
<p>写真1枚で動画を作り、プッシュ通知で常連のお客様へ。Push-taroで始められます。</p>
<Link href="/signup" className="g-cta-btn">無料相談 →</Link>
</div>

</div>
</main>
</>
);
}
