import type { PrintMaterialMeta } from './types';

export const PRINT_MATERIALS: PrintMaterialMeta[] = [
  {
    type: 'trifold',
    label: '三つ折りパンフレット',
    description: 'A4を3つ折り。お店に置いてもらうのに最適。',
    sizeText: 'A4ヨコ（210×297mm）／両面',
    pagesText: '2面（表・裏）',
  },
  {
    type: 'leaflet-a5',
    label: 'リーフレット A5',
    description: 'コンパクトに要点だけ。手渡ししやすいサイズ。',
    sizeText: 'A5（148×210mm）／両面',
    pagesText: '2面（表・裏）',
  },
  {
    type: 'leaflet-a4',
    label: 'リーフレット A4',
    description: 'A5より詳しい内容。じっくり読んでもらえる。',
    sizeText: 'A4（210×297mm）／両面',
    pagesText: '2面（表・裏）',
  },
  {
    type: 'card',
    label: 'カード（名刺サイズ）',
    description: '紹介カード。気軽に配れる販促カード。',
    sizeText: '91×55mm／両面',
    pagesText: '2面（表・裏）',
  },
  {
    type: 'business-card',
    label: '名刺',
    description: '担当者情報入り。商談のお供に。',
    sizeText: '91×55mm／両面',
    pagesText: '2面（表・裏）',
  },
];

export const PRINT_SPEC = {
  bleedMm: 3,
  safeMarginMm: 5,
  dpi: 350,
};
