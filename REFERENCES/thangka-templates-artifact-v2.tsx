import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Palette, 
  Sparkles, 
  Music, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Undo, 
  Download, 
  Layers, 
  Eye, 
  EyeOff, 
  Info, 
  ChevronRight, 
  BookOpen, 
  Moon, 
  Sun,
  Activity,
  Award,
  Grid,
  Heart,
  Feather,
  Sliders,
  HelpCircle
} from 'lucide-react';

// ==========================================
// 專業禪繞唐卡底稿資料庫 (SVG Paths / Path Generator)
// ==========================================
const THANGKA_TEMPLATES = [
  {
    id: 'mandala',
    title: '大日如來壇城',
    englishTitle: 'Vairocana Great Mandala',
    difficulty: '⭐⭐⭐⭐⭐',
    timeCost: '約 45 分鐘',
    desc: '唐卡中最核心的神聖幾何。圓形代表宇宙的圓滿，方形代表壇城的四個城門，內含八葉蓮花瓣。適合練習旋轉對稱禪繞與密緻線條。',
    symbolism: '圓滿、專注、降伏雜念、重整內心秩序。',
    colorPreset: '#FFD700',
    renderGuides: (size) => {
      const center = size / 2;
      const paths = [];
      // 火焰外圈
      paths.push(`<circle cx="${center}" cy="${center}" r="${size * 0.46}" stroke="currentColor" stroke-dasharray="8,6" fill="none" opacity="0.35" stroke-width="1" />`);
      paths.push(`<circle cx="${center}" cy="${center}" r="${size * 0.44}" stroke="currentColor" fill="none" opacity="0.4" stroke-width="1.2" />`);
      // 金剛圈
      paths.push(`<circle cx="${center}" cy="${center}" r="${size * 0.38}" stroke="currentColor" stroke-dasharray="1,4" stroke-width="4" fill="none" opacity="0.6" />`);
      paths.push(`<circle cx="${center}" cy="${center}" r="${size * 0.35}" stroke="currentColor" fill="none" opacity="0.5" stroke-width="1" />`);
      // 四正城門
      const rInner = size * 0.25;
      const rGate = size * 0.08;
      paths.push(`
        <path d="
          M ${center - rInner} ${center - rInner} 
          L ${center - rGate} ${center - rInner}
          L ${center - rGate} ${center - rInner - rGate}
          L ${center + rGate} ${center - rInner - rGate}
          L ${center + rGate} ${center - rInner}
          L ${center + rInner} ${center - rInner}
          L ${center + rInner} ${center - rGate}
          L ${center + rInner + rGate} ${center - rGate}
          L ${center + rInner + rGate} ${center + rGate}
          L ${center + rInner} ${center + rGate}
          L ${center + rInner} ${center + rInner}
          L ${center + rGate} ${center + rInner}
          L ${center + rGate} ${center + rInner + rGate}
          L ${center - rGate} ${center + rInner + rGate}
          L ${center - rGate} ${center + rInner}
          L ${center - rInner} ${center + rInner}
          L ${center - rInner} ${center + rGate}
          L ${center - rInner - rGate} ${center + rGate}
          L ${center - rInner - rGate} ${center - rGate}
          L ${center - rInner} ${center - rGate}
          Z
        " stroke="currentColor" fill="none" stroke-width="1.8" opacity="0.7" />
      `);
      // 八瓣核心蓮花
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x1 = center + Math.cos(angle) * (size * 0.04);
        const y1 = center + Math.sin(angle) * (size * 0.04);
        const x2 = center + Math.cos(angle) * (size * 0.18);
        const y2 = center + Math.sin(angle) * (size * 0.18);
        const cp1x = center + Math.cos(angle - 0.2) * (size * 0.13);
        const cp1y = center + Math.sin(angle - 0.2) * (size * 0.13);
        const cp2x = center + Math.cos(angle + 0.2) * (size * 0.13);
        const cp2y = center + Math.sin(angle + 0.2) * (size * 0.13);
        paths.push(`<path d="M ${x1} ${y1} Q ${cp1x} ${cp1y} ${x2} ${y2} Q ${cp2x} ${cp2y} ${x1} ${y1}" stroke="currentColor" fill="none" stroke-width="1.2" opacity="0.6" />`);
      }
      paths.push(`<circle cx="${center}" cy="${center}" r="${size * 0.03}" stroke="currentColor" fill="none" opacity="0.8" />`);
      return paths.join('');
    }
  },
  {
    id: 'lotus_mantha',
    title: '六字真言八瓣蓮',
    englishTitle: 'Sacred Lotus of Compassion',
    difficulty: '⭐⭐⭐⭐',
    timeCost: '約 30 分鐘',
    desc: '象徵觀世音菩薩的慈悲。中心為清淨蓮蓬，周圍八片蓮花瓣徐徐綻放。適合用來填寫精細的禪繞格紋（如碎石紋、編織網格與淚滴線）。',
    symbolism: '純潔、慈悲心靈的覺醒、出淤泥而不染。',
    colorPreset: '#FF6B6B',
    renderGuides: (size) => {
      const center = size / 2;
      const paths = [];
      paths.push(`<circle cx="${center}" cy="${center}" r="${size * 0.45}" stroke="currentColor" stroke-dasharray="2,2" fill="none" opacity="0.3" />`);
      paths.push(`<circle cx="${center}" cy="${center}" r="${size * 0.40}" stroke="currentColor" fill="none" opacity="0.4" />`);
      
      for (let j = 0; j < 2; j++) {
        const offsetAngle = j * (Math.PI / 8);
        const scale = j === 0 ? 0.38 : 0.30;
        const opacity = j === 0 ? 0.7 : 0.4;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4 + offsetAngle;
          const xStart = center + Math.cos(angle) * (size * 0.06);
          const yStart = center + Math.sin(angle) * (size * 0.06);
          const xEnd = center + Math.cos(angle) * (size * scale);
          const yEnd = center + Math.sin(angle) * (size * scale);
          
          const cpAngle1 = angle - 0.28;
          const cpAngle2 = angle + 0.28;
          const cp1x = center + Math.cos(cpAngle1) * (size * scale * 0.7);
          const cp1y = center + Math.sin(cpAngle1) * (size * scale * 0.7);
          const cp2x = center + Math.cos(cpAngle2) * (size * scale * 0.7);
          const cp2y = center + Math.sin(cpAngle2) * (size * scale * 0.7);
          
          paths.push(`<path d="M ${xStart} ${yStart} C ${cp1x} ${cp1y} ${cp1x} ${cp1y} ${xEnd} ${yEnd} C ${cp2x} ${cp2y} ${cp2x} ${cp2y} ${xStart} ${yStart}" stroke="currentColor" fill="none" opacity="${opacity}" stroke-width="1.5" />`);
          
          const midX = center + Math.cos(angle) * (size * scale * 0.6);
          const midY = center + Math.sin(angle) * (size * scale * 0.6);
          paths.push(`<path d="M ${xStart} ${yStart} L ${midX} ${midY}" stroke="currentColor" stroke-dasharray="2,3" opacity="0.35" />`);
        }
      }
      paths.push(`<circle cx="${center}" cy="${center}" r="${size * 0.08}" stroke="currentColor" fill="none" opacity="0.8" />`);
      for (let i = 0; i < 7; i++) {
        const seedAngle = (i * Math.PI) / 3;
        const seedX = center + (i === 0 ? 0 : Math.cos(seedAngle) * (size * 0.04));
        const seedY = center + (i === 0 ? 0 : Math.sin(seedAngle) * (size * 0.04));
        paths.push(`<circle cx="${seedX}" cy="${seedY}" r="${size * 0.008}" fill="currentColor" opacity="0.8" />`);
      }
      return paths.join('');
    }
  },
  {
    id: 'bodhi_fish',
    title: '菩提雙魚戲水圖',
    englishTitle: 'The Golden Auspicious Fish',
    difficulty: '⭐⭐⭐⭐',
    timeCost: '約 35 分鐘',
    desc: '藏傳佛教八吉祥之一。雙魚代表解脫、自由與和諧。配上優美流暢的菩提葉脈與水波禪繞背景，讓人作畫時心境如流水般豁然開朗。',
    symbolism: '自由無礙、豐饒喜樂、陰陽調和。',
    colorPreset: '#4ECDC4',
    renderGuides: (size) => {
      const center = size / 2;
      const paths = [];
      // 菩提葉
      paths.push(`
        <path d="
          M ${center} ${center - size * 0.45} 
          Q ${center + size * 0.35} ${center - size * 0.1} ${center} ${center + size * 0.42}
          Q ${center - size * 0.35} ${center - size * 0.1} ${center} ${center - size * 0.45}
        " stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.3" stroke-dasharray="6,4" />
      `);
      paths.push(`<path d="M ${center} ${center - size * 0.45} L ${center} ${center + size * 0.42}" stroke="currentColor" opacity="0.25" />`);
      for (let i = 1; i <= 5; i++) {
        const y = center - size * 0.45 + (size * 0.8) * (i / 6);
        paths.push(`<path d="M ${center} ${y} Q ${center + size * 0.2} ${y - size * 0.05} ${center + size * 0.25} ${y - size * 0.12}" stroke="currentColor" opacity="0.15" fill="none" />`);
        paths.push(`<path d="M ${center} ${y} Q ${center - size * 0.2} ${y - size * 0.05} ${center - size * 0.25} ${y - size * 0.12}" stroke="currentColor" opacity="0.15" fill="none" />`);
      }
      // 雙魚
      const drawFish = (cx, cy, scale, angle, isReversed) => {
        const dir = isReversed ? -1 : 1;
        return `
          <g transform="translate(${cx}, ${cy}) rotate(${angle}) scale(${scale})">
            <path d="M -80 0 Q 0 ${-40 * dir} 80 0 Q 0 ${40 * dir} -80 0 Z" stroke="currentColor" fill="none" stroke-width="2" opacity="0.75" />
            <circle cx="50" cy="${5 * dir}" r="4" fill="currentColor" opacity="0.8" />
            <path d="M 40 ${-18 * dir} Q 30 0 40 ${18 * dir}" stroke="currentColor" fill="none" opacity="0.7" />
            <path d="M -80 0 Q -110 ${-30 * dir} -130 ${-15 * dir} Q -110 0 -80 0" stroke="currentColor" fill="none" opacity="0.6" />
            <path d="M -80 0 Q -110 ${30 * dir} -130 ${15 * dir} Q -110 0 -80 0" stroke="currentColor" fill="none" opacity="0.6" />
            <path d="M 10 ${25 * dir} Q -20 ${50 * dir} -15 ${10 * dir}" stroke="currentColor" fill="none" opacity="0.6" />
          </g>
        `;
      };
      paths.push(drawFish(center - size * 0.11, center, 1.1, -25, false));
      paths.push(drawFish(center + size * 0.11, center, 1.1, 155, true));
      paths.push(`<circle cx="${center}" cy="${center}" r="${size * 0.3}" stroke="currentColor" opacity="0.2" stroke-dasharray="4,12" />`);
      return paths.join('');
    }
  },
  {
    id: 'endless_knot',
    title: '無盡意吉祥結',
    englishTitle: 'The Eternal Shrivatsa Knot',
    difficulty: '⭐⭐⭐⭐⭐',
    timeCost: '約 50 分鐘',
    desc: '無盡結代表萬物相互依存的因緣、佛陀無窮盡的智慧與慈悲。線條盤根錯節，一筆貫穿。在這裡你可以順著無限循環的絲帶填滿繁複的禪繞波浪與點點。',
    symbolism: '長壽、無窮智慧、和諧與無盡的慈悲因緣。',
    colorPreset: '#9B5DE5',
    renderGuides: (size) => {
      const center = size / 2;
      const paths = [];
      const s = size * 0.07;
      paths.push(`<rect x="${center - s*4}" y="${center - s*4}" width="${s*8}" height="${s*8}" rx="${s*1.5}" stroke="currentColor" fill="none" stroke-dasharray="10,10" opacity="0.15" />`);
      
      const drawRibbon = (pathString, width = 16) => `
        <path d="${pathString}" stroke="currentColor" fill="none" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="0.65" />
        <path d="${pathString}" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
      `;

      const knotPath = `
        M ${center} ${center - 3.2*s} 
        L ${center + 1.6*s} ${center - 1.6*s} 
        L ${center + 3.2*s} ${center - 3.2*s}
        L ${center + 4.2*s} ${center - 2.2*s}
        L ${center + 2.6*s} ${center - 0.6*s}
        L ${center + 4.2*s} ${center + 1.0*s}
        L ${center + 3.2*s} ${center + 2.0*s}
        L ${center + 1.6*s} ${center + 0.4*s}
        L ${center} ${center + 2.0*s}
        L ${center - 1.6*s} ${center + 0.4*s}
        L ${center - 3.2*s} ${center + 2.0*s}
        L ${center - 4.2*s} ${center + 1.0*s}
        L ${center - 2.6*s} ${center - 0.6*s}
        L ${center - 4.2*s} ${center - 2.2*s}
        L ${center - 3.2*s} ${center - 3.2*s}
        L ${center - 1.6*s} ${center - 1.6*s}
        Z
      `;
      const knotPath2 = `
        M ${center} ${center - 1.2*s} L ${center + 1.6*s} ${center + 0.4*s} L ${center} ${center + 2.0*s} L ${center - 1.6*s} ${center + 0.4*s} Z
      `;
      paths.push(drawRibbon(knotPath, s * 0.6));
      paths.push(drawRibbon(knotPath2, s * 0.4));
      return paths.join('');
    }
  },
  {
    id: 'vajra',
    title: '智慧五股金剛杵',
    englishTitle: 'The Five-Pronged Vajra',
    difficulty: '⭐⭐⭐⭐⭐',
    timeCost: '約 55 分鐘',
    desc: '密宗最神聖的法器。金剛杵代表堅固無比之菩提心與摧破一切愚痴雜念的般若智慧。其強烈的上下與左右完美中軸對稱，特別適合配合多向鏡像筆劃作畫。',
    symbolism: '斷除執著、摧破心魔、成就無退轉之菩提心。',
    colorPreset: '#FFAA00',
    renderGuides: (size) => {
      const center = size / 2;
      const paths = [];
      const unit = size / 600;

      // 繪製對稱的金剛杵主軸
      // 中心圓珠 (摩尼寶珠)
      paths.push(`<circle cx="${center}" cy="${center}" r="${32 * unit}" stroke="currentColor" fill="none" stroke-width="2" opacity="0.8" />`);
      paths.push(`<circle cx="${center}" cy="${center}" r="${8 * unit}" stroke="currentColor" fill="none" opacity="0.5" />`);
      
      // 兩側蓮花座與尖端 (上下對稱繪製)
      const drawHalfVajra = (isUpper) => {
        const sign = isUpper ? -1 : 1;
        const offset = center + sign * (32 * unit);
        const u = sign * unit;
        return `
          <!-- 蓮座 -->
          <path d="M ${center - 50*unit} ${offset} Q ${center} ${offset + 25*u} ${center + 50*unit} ${offset}" stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.7" />
          <path d="M ${center - 65*unit} ${offset + 28*u} C ${center - 40*unit} ${offset + 5*u} ${center + 40*unit} ${offset + 5*u} ${center + 65*unit} ${offset + 28*u} Z" stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.8" />
          
          <!-- 主金剛股 (中鋒) -->
          <path d="M ${center - 10*unit} ${offset + 28*u} L ${center} ${offset + 195*u} L ${center + 10*unit} ${offset + 28*u}" stroke="currentColor" fill="none" stroke-width="1.8" opacity="0.9" />
          
          <!-- 兩側外股 (弧形合抱) -->
          <path d="M ${center - 45*unit} ${offset + 28*u} C ${center - 100*unit} ${offset + 100*u} ${center - 50*unit} ${offset + 175*u} ${center} ${offset + 195*u}" stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.85" />
          <path d="M ${center + 45*unit} ${offset + 28*u} C ${center + 100*unit} ${offset + 100*u} ${center + 50*unit} ${offset + 175*u} ${center} ${offset + 195*u}" stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.85" />
          
          <!-- 脇股裝飾勾勒 -->
          <path d="M ${center - 25*unit} ${offset + 28*u} C ${center - 55*unit} ${offset + 80*u} ${center - 25*unit} ${offset + 140*u} ${center} ${offset + 155*u}" stroke="currentColor" fill="none" opacity="0.6" stroke-dasharray="2,2" />
          <path d="M ${center + 25*unit} ${offset + 28*u} C ${center + 55*unit} ${offset + 80*u} ${center + 25*unit} ${offset + 140*u} ${center} ${offset + 155*u}" stroke="currentColor" fill="none" opacity="0.6" stroke-dasharray="2,2" />
        `;
      };
      
      paths.push(drawHalfVajra(true));
      paths.push(drawHalfVajra(false));
      
      // 背景神聖壇城射線
      paths.push(`<circle cx="${center}" cy="${center}" r="${size * 0.42}" stroke="currentColor" stroke-dasharray="10,12" opacity="0.2" />`);
      return paths.join('');
    }
  },
  {
    id: 'conch',
    title: '吉祥右旋白法螺',
    englishTitle: 'The Sacred White Conch',
    difficulty: '⭐⭐⭐⭐',
    timeCost: '約 40 分鐘',
    desc: '法螺之音妙廣深遠，妙音右旋代表佛陀說法妙音廣傳。白螺上自然的螺紋呈「黃金對數螺旋線」向外生長，非常適合練習「新月」、「立體編織」與漸變線條。',
    symbolism: '消除愚痴、妙音遠揚、吉祥如意與善緣降臨。',
    colorPreset: '#8CE7FF',
    renderGuides: (size) => {
      const center = size / 2;
      const paths = [];
      const u = size / 600;

      // 繪製帶有流動雲紋的法螺輪廓
      // 法螺主體
      paths.push(`
        <path d="
          M ${center - 20*u} ${center - 130*u}
          C ${center + 130*u} ${center - 180*u} ${center + 190*u} ${center + 30*u} ${center + 50*u} ${center + 160*u}
          C ${center - 10*u} ${center + 220*u} ${center - 160*u} ${center + 140*u} ${center - 110*u} ${center - 10*u}
          C ${center - 80*u} ${center - 100*u} ${center - 50*u} ${center - 110*u} ${center - 20*u} ${center - 130*u}
          Z
        " stroke="currentColor" fill="none" stroke-width="2" opacity="0.8" />
      `);
      
      // 法螺右旋內部螺旋核心 (黃金螺旋點描)
      paths.push(`
        <path d="
          M ${center - 20*u} ${center - 130*u}
          C ${center + 50*u} ${center - 90*u} ${center + 60*u} ${center + 20*u} ${center - 20*u} ${center + 60*u}
          C ${center - 70*u} ${center + 80*u} ${center - 110*u} ${center + 10*u} ${center - 60*u} ${center - 40*u}
          C ${center - 20*u} ${center - 60*u} ${center + 10*u} ${center - 10*u} ${center - 10*u} ${center + 20*u}
          C ${center - 20*u} ${center + 30*u} ${center - 40*u} ${center + 10*u} ${center - 30*u} ${center - 10*u}
        " stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.75" />
      `);

      // 法螺飄帶飾品 (傳統唐卡裝飾)
      paths.push(`
        <path d="
          M ${center - 100*u} ${center + 120*u}
          Q ${center - 200*u} ${center + 200*u} ${center - 130*u} ${center + 250*u}
          T ${center - 220*u} ${center + 160*u}
        " stroke="currentColor" fill="none" stroke-dasharray="4,4" opacity="0.4" />
        <path d="
          M ${center + 100*u} ${center + 100*u}
          Q ${center + 220*u} ${center + 180*u} ${center + 160*u} ${center + 250*u}
          T ${center + 240*u} ${center + 150*u}
        " stroke="currentColor" fill="none" stroke-dasharray="4,4" opacity="0.4" />
      `);
      
      // 螺頂尖端細節
      paths.push(`<path d="M ${center - 20*u} ${center - 130*u} L ${center - 35*u} ${center - 170*u} Q ${center - 20*u} ${center - 190*u} ${center - 10*u} ${center - 165*u} Z" stroke="currentColor" fill="none" opacity="0.6" />`);
      
      return paths.join('');
    }
  }
];

// ==========================================
// 禪繞畫預設「禪繞格紋 (Tangles)」參考資料庫
// ==========================================
const ZENTANGLE_PATTERNS = [
  { 
    name: '新月 (Crescent Moon)', 
    symbol: '🌙', 
    desc: '半月形層層外拓線條', 
    difficulty: '⭐',
    steps: ['畫出基礎半月，並將其塗黑。', '在半月邊緣，以外推方式畫出等距輪廓線（光環）。', '重複疊加光環，並可在其間填補細密網點線。']
  },
  { 
    name: '立體編織 (Cadent)', 
    symbol: '🧇', 
    desc: '網格與Ｓ型優雅連接線', 
    difficulty: '⭐⭐',
    steps: ['以等距畫出點狀矩陣網格。', '在點與點之間，用優美的「Ｓ」形流暢弧線相連。', '在相鄰行用反向「Ｓ」相連，中間塗黑或點綴以顯立體感。']
  },
  { 
    name: '烈焰 (Fescu)', 
    symbol: '🌱', 
    desc: '如細草芽般舒張的曲線', 
    difficulty: '⭐',
    steps: ['一筆拉出優雅向上傾斜的卷鬚狀細線。', '在頂端畫出一個淚滴狀或小水滴的小囊，將其塗黑。', '可自由在兩側加上細小的葉脈，呈散狀舒張。']
  },
  { 
    name: '碎石靜心 (Mooka)', 
    symbol: '🐚', 
    desc: '流暢如葉芽或貝殼的圓弧', 
    difficulty: '⭐⭐⭐',
    steps: ['畫出一條柔美的向上拋物線，在頂點往內捲成圓弧。', '順著原路徑往回描摹，加寬基底，形成如植物嫩芽的葉片。', '成組堆疊，讓它們互相依傍簇擁。']
  },
  { 
    name: '烈日火焰 (Paradox)', 
    symbol: '🌀', 
    desc: '純直線拉出的扭轉幾何幻覺', 
    difficulty: '⭐⭐⭐⭐',
    steps: ['在三角或多邊形格子內，由一角向對邊稍偏移處拉一條直線。', '旋轉畫布，由新落點向下一條邊同樣偏移處拉直線。', '不斷重複，直到三角形向內自然扭轉成漩渦狀。']
  },
  { 
    name: '神聖迴圈 (Hollibaugh)', 
    symbol: '🌉', 
    desc: '交錯穿插的立體緞帶線', 
    difficulty: '⭐⭐',
    steps: ['在畫布任意拉出兩條平行粗線（高速公路）。', '拉出第二組平行粗線時，當遇到第一組，則斷開（假裝從其底下穿過）。', '重複多組，營造極具層次的前後空間編織感。']
  }
];

export default function App() {
  // 頁面狀態：'gallery' (選擇大廳) 或 'canvas' (創作畫布)
  const [viewMode, setViewMode] = useState('gallery');
  const [selectedTemplate, setSelectedTemplate] = useState(THANGKA_TEMPLATES[0]);
  
  // 繪圖基本設定
  const [brushColor, setBrushColor] = useState('#FFD700');
  const [brushWidth, setBrushWidth] = useState(3);
  const [brushOpacity, setBrushOpacity] = useState(1.0);
  const [symmetryFactor, setSymmetryFactor] = useState(8);
  const [isSymmetryEnabled, setIsSymmetryEnabled] = useState(true);
  
  // 筆刷樣式 (新增大師筆感系統)
  // 'fineliner' (針筆), 'bamboo' (藏式竹筆), 'gold_foil' (發光金描), 'ink_wash' (虛空暈染)
  const [brushStyle, setBrushStyle] = useState('fineliner');
  
  // 底稿圖層控制
  const [draftOpacity, setDraftOpacity] = useState(0.4);
  const [showDraft, setShowDraft] = useState(true);
  
  // 新增：度量比例線 (Tikse Grid) 控制
  const [showTikseGrid, setShowTikseGrid] = useState(false);
  
  // 新增：吉祥織錦裝裱外框 (Brocade Border) 匯出選項
  const [exportWithBrocade, setExportWithBrocade] = useState(true);
  
  // 音樂冥想狀態 (新增雙聲道Om音聲)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [soundFrequency, setSoundFrequency] = useState(110); // 110Hz (頌缽) 或 55Hz (宇宙Om音)
  
  // 呼吸引導狀態
  const [breathState, setBreathState] = useState('吸氣');
  const [breathProgress, setBreathProgress] = useState(0);
  
  // 系統主題 (暗色更適合金絲發光線條)
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // 畫布、歷史紀錄 Ref
  const canvasRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState(600);
  
  // 新增：正念統計
  const [strokeCount, setStrokeCount] = useState(0);
  const [activeZenMinutes, setActiveZenMinutes] = useState(0);
  
  // 新增：互動禪繞步驟導覽 Popover 狀態
  const [activePatternGuide, setActivePatternGuide] = useState(null);

  // 自訂調色盤 (傳統藏傳佛教修持色)
  const palettePresets = [
    { name: '大日金泥', hex: '#FFD700', desc: '金剛界壇城金絲描邊' },
    { name: '硃砂紅', hex: '#E63946', desc: '護法金剛憤怒熱烈' },
    { name: '度母松石綠', hex: '#2A9D8F', desc: '度母慈悲平靜綠' },
    { name: '藥師佛藍', hex: '#1D3557', desc: '琉璃澄淨智慧藍' },
    { name: '白螺潔白', hex: '#F1FAEE', desc: '蓮花座清淨無染白' },
    { name: '玄鐵炭黑', hex: '#111111', desc: '極細針筆禪繞陰影' },
  ];

  // 音效/音樂 Web Audio API 節點
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef({ osc1: null, osc2: null, gain: null, lfo: null });

  // ------------------------------------------
  // 初始化 Web Audio API (梵音頌缽與 Om 共振音)
  // ------------------------------------------
  const startZenSound = (freq = soundFrequency) => {
    try {
      if (audioNodesRef.current.osc1) {
        stopZenSound();
      }

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // 雙耳差頻共鳴
      osc2.type = freq < 80 ? 'sawtooth' : 'sine'; // 低頻Om音用鋸齒波增加渾厚感
      osc2.frequency.setValueAtTime(freq * 1.5 + 0.3, ctx.currentTime);

      lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
      lfoGain.gain.setValueAtTime(freq < 80 ? 2 : 12, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(freq < 80 ? 0.08 : 0.12, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc2.frequency);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      lfo.start();

      audioNodesRef.current = { osc1, osc2, gain: gainNode, lfo };
      setIsPlayingAudio(true);
    } catch (e) {
      console.warn("音訊啟動失敗:", e);
    }
  };

  const stopZenSound = () => {
    const { osc1, osc2, lfo } = audioNodesRef.current;
    if (osc1) try { osc1.stop(); } catch(e){}
    if (osc2) try { osc2.stop(); } catch(e){}
    if (lfo) try { lfo.stop(); } catch(e){}
    audioNodesRef.current = { osc1: null, osc2: null, gain: null, lfo: null };
    setIsPlayingAudio(false);
  };

  const toggleZenMusic = (freq = soundFrequency) => {
    if (isPlayingAudio && freq === soundFrequency) {
      stopZenSound();
    } else {
      setSoundFrequency(freq);
      startZenSound(freq);
    }
  };

  // ------------------------------------------
  // 正念計時與呼吸定時器
  // ------------------------------------------
  useEffect(() => {
    let breathTimer = setInterval(() => {
      setBreathProgress((prev) => {
        if (prev >= 100) {
          setBreathState((currentState) => {
            switch (currentState) {
              case '吸氣': return '持氣(靜止)';
              case '持氣(靜止)': return '吐氣';
              case '吐氣': return '空息(放空)';
              default: return '吸氣';
            }
          });
          return 0;
        }
        return prev + 2.5; // 每 100ms 跑 2.5% -> 4 秒一個呼吸動作
      });
    }, 100);

    return () => clearInterval(breathTimer);
  }, []);

  useEffect(() => {
    let minuteTimer;
    if (viewMode === 'canvas') {
      minuteTimer = setInterval(() => {
        setActiveZenMinutes((prev) => prev + 1);
      }, 60000);
    }
    return () => clearInterval(minuteTimer);
  }, [viewMode]);

  // ------------------------------------------
  // 畫布基礎與調整尺寸
  // ------------------------------------------
  useEffect(() => {
    if (viewMode === 'canvas') {
      const handleResize = () => {
        const container = document.getElementById('canvas-container');
        if (container) {
          const side = Math.min(container.clientWidth - 32, 600);
          setCanvasSize(side);
        }
      };
      
      setTimeout(handleResize, 100);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'canvas' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.fillStyle = isDarkMode ? '#0F101A' : '#FFFFFF';
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      
      if (history.length > 0 && historyPointer >= 0) {
        redrawHistory(historyPointer);
      } else {
        saveState();
      }
    }
  }, [canvasSize, viewMode, isDarkMode]);

  // ------------------------------------------
  // 繪製度量比例線 (Tikse) 的輔助函數
  // ------------------------------------------
  const renderTikseOverlay = (size) => {
    const center = size / 2;
    const lines = [];
    // 圓心十字中軸線
    lines.push(`<line x1="${center}" y1="0" x2="${center}" y2="${size}" stroke="#D97706" stroke-dasharray="2,6" stroke-width="1.2" opacity="0.4" />`);
    lines.push(`<line x1="0" y1="${center}" x2="${size}" y2="${center}" stroke="#D97706" stroke-dasharray="2,6" stroke-width="1.2" opacity="0.4" />`);
    
    // 對角比例線
    lines.push(`<line x1="0" y1="0" x2="${size}" y2="${size}" stroke="#D97706" stroke-dasharray="1,8" stroke-width="0.8" opacity="0.3" />`);
    lines.push(`<line x1="${size}" y1="0" x2="0" y2="${size}" stroke="#D97706" stroke-dasharray="1,8" stroke-width="0.8" opacity="0.3" />`);
    
    // 度量大方框
    lines.push(`<rect x="${size * 0.08}" y="${size * 0.08}" width="${size * 0.84}" height="${size * 0.84}" stroke="#D97706" stroke-dasharray="4,6" fill="none" stroke-width="1" opacity="0.25" />`);
    
    // concentric rings concentric to Tibetan standard geometry
    lines.push(`<circle cx="${center}" cy="${center}" r="${size * 0.16}" stroke="#D97706" stroke-dasharray="2,4" fill="none" stroke-width="0.8" opacity="0.3" />`);
    lines.push(`<circle cx="${center}" cy="${center}" r="${size * 0.32}" stroke="#D97706" stroke-dasharray="2,4" fill="none" stroke-width="0.8" opacity="0.3" />`);
    
    return lines.join('');
  };

  // ------------------------------------------
  // 繪圖核心與動態筆觸模擬
  // ------------------------------------------
  const getCoordinates = (e) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;
    
    setIsDrawing(true);
    setLastPos(coords);
    setStrokeCount(prev => prev + 1);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const x0 = lastPos.x;
    const y0 = lastPos.y;
    const x1 = coords.x;
    const y1 = coords.y;

    // 計算運筆速度與角度，用於大師級筆刷動態計算
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    ctx.save();
    
    // A. 套用筆刷流派 (Zen Brushes)
    if (brushStyle === 'bamboo') {
      // 藏式竹筆：寬度與移動角度和速度成比例，呈現一邊寬一邊細的刀鋒感
      const angleFactor = Math.abs(Math.sin(angle - Math.PI/4));
      ctx.lineWidth = brushWidth * (0.3 + 0.9 * angleFactor);
      ctx.strokeStyle = brushColor;
      ctx.globalAlpha = brushOpacity;
      ctx.shadowBlur = 0;
    } 
    else if (brushStyle === 'gold_foil') {
      // 瀝粉貼金：亮黃色加強高光，自帶金屬發光投影，呈現立體鑲金感
      ctx.lineWidth = brushWidth;
      ctx.strokeStyle = '#FFE342';
      ctx.globalAlpha = brushOpacity;
      ctx.shadowColor = 'rgba(218, 165, 32, 0.6)';
      ctx.shadowBlur = brushWidth * 1.8;
    } 
    else if (brushStyle === 'ink_wash') {
      // 虛空暈染：極低透明度、寬筆畫、邊緣羽化，多次描邊層疊
      ctx.lineWidth = brushWidth * 3.5;
      ctx.strokeStyle = brushColor;
      ctx.globalAlpha = brushOpacity * 0.15;
      ctx.shadowColor = brushColor;
      ctx.shadowBlur = brushWidth * 1.2;
    } 
    else {
      // 玄鐵針筆 (fineliner)
      ctx.lineWidth = brushWidth;
      ctx.strokeStyle = brushColor;
      ctx.globalAlpha = brushOpacity;
      ctx.shadowBlur = 0;
    }

    const cx = canvasSize / 2;
    const cy = canvasSize / 2;

    if (isSymmetryEnabled) {
      for (let i = 0; i < symmetryFactor; i++) {
        const rotationAngle = (i * 2 * Math.PI) / symmetryFactor;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotationAngle);
        
        // 原始向
        ctx.beginPath();
        ctx.moveTo(x0 - cx, y0 - cy);
        ctx.lineTo(x1 - cx, y1 - cy);
        ctx.stroke();

        // 鏡像對稱
        ctx.scale(1, -1);
        ctx.beginPath();
        ctx.moveTo(x0 - cx, y0 - cy);
        ctx.lineTo(x1 - cx, y1 - cy);
        ctx.stroke();

        ctx.restore();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    ctx.restore();
    setLastPos(coords);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  // ------------------------------------------
  // 復原、歷史紀錄機制
  // ------------------------------------------
  const saveState = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    const newHistory = history.slice(0, historyPointer + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryPointer(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const prevPointer = historyPointer - 1;
      setHistoryPointer(prevPointer);
      redrawHistory(prevPointer);
    }
  };

  const redrawHistory = (pointer) => {
    if (!canvasRef.current || pointer < 0 || !history[pointer]) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = history[pointer];
    img.onload = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
    };
  };

  const handleClear = () => {
    if (window.confirm('確定要清除目前的畫作，重新開始嗎？你的靜心軌跡將會重置。')) {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = isDarkMode ? '#0F101A' : '#FFFFFF';
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      
      const cleanState = canvas.toDataURL();
      setHistory([cleanState]);
      setHistoryPointer(0);
      setStrokeCount(0);
    }
  };

  // ------------------------------------------
  // 匯出功能 (支援加裝吉祥織錦外框)
  // ------------------------------------------
  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const exportCanvas = document.createElement('canvas');
    const borderSize = exportWithBrocade ? 120 : 0; // 裝邊加寬
    const fullSize = 1200 + borderSize * 2;
    
    exportCanvas.width = fullSize;
    exportCanvas.height = fullSize;
    const eCtx = exportCanvas.getContext('2d');
    
    // 1. 如果有加裝織錦框，先畫織錦背景
    if (exportWithBrocade) {
      // 深藏青錦緞底色
      eCtx.fillStyle = '#0F1123';
      eCtx.fillRect(0, 0, fullSize, fullSize);
      
      // 繪製紅色彩帶內緣
      eCtx.fillStyle = '#7C1525';
      eCtx.fillRect(borderSize - 40, borderSize - 40, 1200 + 80, 1200 + 80);
      
      // 繪製黃金分割邊界線
      eCtx.strokeStyle = '#D4AF37';
      eCtx.lineWidth = 10;
      eCtx.strokeRect(borderSize - 15, borderSize - 15, 1200 + 30, 1200 + 30);
      eCtx.strokeRect(20, 20, fullSize - 40, fullSize - 40);

      // 繪製四角吉祥幾何祥雲紋 (用線條勾勒)
      eCtx.lineWidth = 4;
      eCtx.strokeStyle = '#EAA81B';
      const corners = [
        [30, 30], [fullSize - 80, 30], [30, fullSize - 80], [fullSize - 80, fullSize - 80]
      ];
      corners.forEach(([cx, cy]) => {
        eCtx.strokeRect(cx, cy, 50, 50);
        eCtx.beginPath();
        eCtx.arc(cx + 25, cy + 25, 15, 0, Math.PI * 2);
        eCtx.stroke();
      });
    }

    // 2. 繪製手繪大圖背景
    const drawX = borderSize;
    const drawY = borderSize;
    eCtx.fillStyle = isDarkMode ? '#0F101A' : '#FFFFFF';
    eCtx.fillRect(drawX, drawY, 1200, 1200);

    // 3. 繪製底稿浮水印
    if (showDraft) {
      eCtx.save();
      const draftColor = isDarkMode ? 'rgba(255, 215, 0, 0.16)' : 'rgba(0, 0, 0, 0.14)';
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 600 600">
          <g color="${draftColor}">
            ${selectedTemplate.renderGuides(600)}
          </g>
        </svg>
      `;
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      
      img.onload = () => {
        eCtx.drawImage(img, drawX, drawY, 1200, 1200);
        
        // 4. 合併玩家的手繪畫作
        const userImg = new Image();
        userImg.src = canvasRef.current.toDataURL();
        userImg.onload = () => {
          eCtx.drawImage(userImg, drawX, drawY, 1200, 1200);
          
          // 5. 自動下載
          const link = document.createElement('a');
          link.download = `覺知畫布_禪繞唐卡_${selectedTemplate.title}.png`;
          link.href = exportCanvas.toDataURL('image/png');
          link.click();
        };
      };
      eCtx.restore();
    } else {
      // 無底稿則直接輸出玩家創作
      const userImg = new Image();
      userImg.src = canvasRef.current.toDataURL();
      userImg.onload = () => {
        eCtx.drawImage(userImg, drawX, drawY, 1200, 1200);
        const link = document.createElement('a');
        link.download = `覺知畫布_手繪禪繞唐卡.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
      };
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#06070D] text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* 頂部導航 */}
      <header className={`border-b ${isDarkMode ? 'border-gray-800/80 bg-[#0A0C13]' : 'border-gray-200 bg-white'} px-6 py-4 sticky top-0 z-50 transition-all`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-amber-500/15 text-amber-500 animate-pulse">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-wider font-serif flex items-center gap-2">
                <span>覺知畫布：禪繞唐卡</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-sans tracking-tight">
                  V2.0 般若金剛版
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">融合傳統度量比例與現代禪繞筆感的交互冥想空間</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 md:gap-3">
            {/* 音頻音效多頻率選擇 */}
            <div className="flex items-center bg-gray-500/10 rounded-full p-0.5 border border-gray-800">
              <button
                onClick={() => toggleZenMusic(110)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                  isPlayingAudio && soundFrequency === 110
                    ? 'bg-amber-500/20 text-amber-400 font-bold' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {isPlayingAudio && soundFrequency === 110 && <Volume2 className="w-3 h-3 animate-bounce" />}
                <span>110Hz 頌缽</span>
              </button>
              <button
                onClick={() => toggleZenMusic(55)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                  isPlayingAudio && soundFrequency === 55
                    ? 'bg-purple-500/20 text-purple-400 font-bold' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {isPlayingAudio && soundFrequency === 55 && <Volume2 className="w-3 h-3 animate-bounce" />}
                <span>55Hz 宇宙Om音</span>
              </button>
              {isPlayingAudio && (
                <button 
                  onClick={stopZenSound}
                  className="p-1 text-red-400 hover:text-red-300 ml-1"
                  title="靜音"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 主題 */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-600'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {viewMode === 'canvas' && (
              <button
                onClick={() => {
                  stopZenSound();
                  setViewMode('gallery');
                }}
                className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
              >
                <BookOpen className="w-3.5 h-3.5" />
                返回選圖大廳
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==========================================
          視圖 A：禪繞唐卡選擇畫廊 (Gallery)
          ========================================== */}
      {viewMode === 'gallery' && (
        <main className="max-w-7xl mx-auto px-6 py-10 animate-fadeIn">
          
          {/* 精神引導橫幅 */}
          <div className={`p-8 rounded-3xl mb-12 relative overflow-hidden border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-[#0F111E] to-[#141829] border-gray-800' 
              : 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-100'
          }`}>
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-12 translate-x-12">
              <Compass className="w-96 h-96" />
            </div>
            
            <div className="max-w-3xl relative z-10">
              <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">Tibetan Zentangle Art & Tikse Geometry</span>
              <h2 className="text-3xl md:text-4xl font-serif font-extrabold mt-2 mb-4 leading-tight">
                「線條即呼吸，筆觸現菩提」
              </h2>
              <p className="text-sm md:text-base leading-relaxed opacity-85 mb-6">
                禪繞唐卡不追求完美的繪畫技巧，而是透過高度重複、有秩序感的筆劃，將混亂的心靈沉澱。
                我們為您準備了 **六大吉祥傳統神聖底圖**。結合了西藏標準度量學比例（Tikse）與禪繞畫格紋導師，
                請選擇一幅今日與您心神共鳴的圖騰，開啟您的定靜自觀旅程。
              </p>
              
              <div className="flex flex-wrap gap-3 text-xs font-medium">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-amber-400">
                  <Grid className="w-3.5 h-3.5" />
                  <span>Tibetan Tikse 度量規</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-purple-400">
                  <Palette className="w-3.5 h-3.5" />
                  <span>貼金與竹筆四大筆觸</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-emerald-400">
                  <Music className="w-3.5 h-3.5" />
                  <span>110Hz/55Hz 雙重梵音共鳴</span>
                </div>
              </div>
            </div>
          </div>

          {/* 圖騰選擇網格 */}
          <div className="mb-8 flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-lg font-serif font-semibold tracking-wider flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-500" />
              挑選您要靜心繪製的唐卡神聖圖騰：
            </h3>
            <span className="text-xs opacity-60">共 6 款大師級高精細底稿</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {THANGKA_TEMPLATES.map((tpl) => {
              const isActive = selectedTemplate.id === tpl.id;
              return (
                <div 
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`group rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isActive 
                      ? 'border-amber-500/80 bg-amber-500/5 shadow-lg shadow-amber-500/5' 
                      : isDarkMode 
                        ? 'border-gray-800 bg-[#0C0E18]/80 hover:border-gray-700 hover:bg-[#0C0E18]' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* SVG 預覽圖 */}
                    <div className={`aspect-square rounded-xl p-6 flex items-center justify-center mb-4 transition-all ${
                      isDarkMode ? 'bg-[#07080E]' : 'bg-gray-50'
                    } group-hover:scale-[1.02]`}>
                      <svg 
                        viewBox="0 0 400 400" 
                        className={`w-full h-full ${isActive ? 'text-amber-500' : 'text-gray-400/70 group-hover:text-gray-300'}`}
                        dangerouslySetInnerHTML={{ __html: tpl.renderGuides(400) }}
                      />
                    </div>

                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg font-serif">{tpl.title}</h4>
                      <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-gray-500/10 text-gray-400">
                        {tpl.id === 'vajra' || tpl.id === 'conch' ? '吉祥八寶' : '神聖幾何'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-serif mb-3 italic">{tpl.englishTitle}</p>
                    <p className="text-xs opacity-75 line-clamp-3 mb-4 leading-relaxed">{tpl.desc}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800/40">
                    <div className="flex justify-between text-[11px] opacity-60 mb-4">
                      <span>難易度: {tpl.difficulty}</span>
                      <span>{tpl.timeCost}</span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(tpl);
                        setViewMode('canvas');
                        startZenSound(110); // 自動開啟110Hz頌缽聲進入靜心
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        isActive 
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                          : 'bg-gray-500/15 text-gray-300 hover:bg-gray-500/25'
                      }`}
                    >
                      <span>進入靜心繪製</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 教學補充 */}
          <section className={`mt-16 p-8 rounded-2xl border ${
            isDarkMode ? 'bg-[#0E1019] border-gray-800' : 'bg-stone-50 border-stone-200'
          }`}>
            <h4 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              禪繞唐卡新手靜心五步法
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-xs md:text-sm">
              <div className="space-y-1.5">
                <div className="font-bold text-amber-500">1. 平靜入定</div>
                <p className="opacity-75 text-xs leading-relaxed">坐在舒適椅子上，開啟「110Hz背景頌缽音」，讓外界嘈雜與腦海執念漸漸退去。</p>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-amber-500">2. 度量對齊</div>
                <p className="opacity-75 text-xs leading-relaxed">看著底稿比例。建議可開啟「度量比例線」，感知唐卡藝術在虛空中建立黃金秩序的過程。</p>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-amber-500">3. 筆隨氣行</div>
                <p className="opacity-75 text-xs leading-relaxed">開啟對稱模式。順著底稿格線，重複地畫出一條條波浪。嘗試在呼吸「吐氣」時拉出平穩長線。</p>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-amber-500">4. 瀝粉貼金</div>
                <p className="opacity-75 text-xs leading-relaxed">在需要強調的邊緣與核心線條使用「瀝粉貼金」或「藏式竹筆」，營造出唐卡豐富的立體起伏與貴氣。</p>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-amber-500">5. 織錦封存</div>
                <p className="opacity-75 text-xs leading-relaxed">完成後，一鍵加裝「五彩吉祥織錦外框」並匯出高解析畫作。欣賞這一幅只屬於您靈魂秩序的圓滿壇城。</p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ==========================================
          視圖 B：互動覺知創作畫布 (Canvas)
          ========================================== */}
      {viewMode === 'canvas' && (
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 左側：靜心導引與禪繞參考板面 (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 目前底稿狀態卡 */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0E1018]/90 border-gray-800' : 'bg-white border-gray-200'}`}>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold uppercase tracking-wider">
                  目前修持底稿
                </span>
                <h3 className="text-xl font-bold font-serif mt-2 mb-1">{selectedTemplate.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{selectedTemplate.englishTitle}</p>
                
                <div className="p-3 rounded-lg bg-gray-500/5 text-xs space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="opacity-60">象徵意義：</span>
                    <span className="font-medium text-amber-400 text-right max-w-[180px] truncate" title={selectedTemplate.symbolism}>
                      {selectedTemplate.symbolism}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">禪繞推薦：</span>
                    <span className="font-medium">
                      {selectedTemplate.id === 'conch' ? 'Crescent Moon 新月' : 'Paradox 扭轉線'}
                    </span>
                  </div>
                </div>
                
                {/* 快捷切換 */}
                <div className="pt-3 border-t border-gray-800/40">
                  <label className="text-[11px] opacity-60 block mb-2">快速切換其他唐卡底圖：</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {THANGKA_TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={`py-1.5 px-1 rounded text-[10px] font-bold border truncate transition-all ${
                          selectedTemplate.id === t.id 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/40' 
                            : 'border-transparent bg-gray-500/10 text-gray-400 hover:bg-gray-500/15'
                        }`}
                        title={t.title}
                      >
                        {t.title.substring(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 大師筆觸工坊與神聖幾何對稱 */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0E1018]/90 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-sm font-bold font-serif mb-4 flex items-center gap-1.5 border-b border-gray-800/40 pb-2">
                  <Palette className="w-4 h-4 text-amber-500" />
                  大師筆觸工坊 & 旋轉對稱
                </h4>

                <div className="space-y-4">
                  {/* 極座標對稱設定 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold">神聖鏡像旋轉對稱</span>
                      <button 
                        onClick={() => setIsSymmetryEnabled(!isSymmetryEnabled)}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${
                          isSymmetryEnabled 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35' 
                            : 'bg-gray-500/15 text-gray-400'
                        }`}
                      >
                        {isSymmetryEnabled ? '已啟用' : '自由手繪'}
                      </button>
                    </div>
                    {isSymmetryEnabled && (
                      <div className="space-y-2 bg-black/20 p-2 rounded">
                        <div className="flex justify-between text-[11px] opacity-60">
                          <span>對稱瓣數 (Symmetry): {symmetryFactor} 鏡像分割</span>
                        </div>
                        <input 
                          type="range" 
                          min="2" 
                          max="12" 
                          step="2"
                          value={symmetryFactor}
                          onChange={(e) => setSymmetryFactor(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* 禪繞大師筆觸流派選擇 (NEW) */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold flex items-center gap-1">
                      <Feather className="w-3.5 h-3.5 text-amber-400" />
                      大師級筆觸流派：
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'fineliner', name: '玄鐵針筆', desc: '均勻細密，適合禪繞畫' },
                        { id: 'bamboo', name: '藏式竹筆', desc: '寬度隨運筆角度變化' },
                        { id: 'gold_foil', name: '瀝粉貼金', desc: '發光立體，富貴金飾' },
                        { id: 'ink_wash', name: '虛空暈染', desc: '毛邊模糊，適合作陰影' }
                      ].map(brush => (
                        <button
                          key={brush.id}
                          onClick={() => setBrushStyle(brush.id)}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            brushStyle === brush.id
                              ? 'border-amber-500 bg-amber-500/5'
                              : 'border-transparent bg-gray-500/5 hover:bg-gray-500/10'
                          }`}
                        >
                          <div className="text-xs font-bold text-amber-400">{brush.name}</div>
                          <div className="text-[9px] opacity-60 mt-0.5 leading-tight">{brush.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 筆刷設定 */}
                  <div className="space-y-3 pt-3 border-t border-gray-800/40">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>筆尖粗細: {brushWidth}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="12" 
                        value={brushWidth}
                        onChange={(e) => setBrushWidth(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>墨水透明度: {Math.round(brushOpacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="5"
                        value={brushOpacity * 100}
                        onChange={(e) => setBrushOpacity(Number(e.target.value) / 100)}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* 唐卡調色盤 */}
                  <div className="space-y-2 pt-3 border-t border-gray-800/40">
                    <span className="text-xs font-semibold block">修持法色調：</span>
                    <div className="grid grid-cols-3 gap-2">
                      {palettePresets.map((color) => {
                        const isSelected = brushColor === color.hex;
                        return (
                          <button
                            key={color.name}
                            onClick={() => setBrushColor(color.hex)}
                            className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                              isSelected 
                                ? 'border-amber-500 bg-amber-500/5 shadow' 
                                : 'border-transparent hover:bg-gray-500/5'
                            }`}
                          >
                            <div 
                              className="w-full h-4 rounded-md border border-white/10" 
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-[9px] font-medium truncate w-full text-center">{color.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 經典禪繞圖案 (Tangles) 步驟教學面板 */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0E1018]/90 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-sm font-bold font-serif mb-3 flex items-center gap-1.5 text-amber-500">
                  <BookOpen className="w-4 h-4" />
                  禪繞格紋繪製步驟導師
                </h4>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {ZENTANGLE_PATTERNS.map(pattern => (
                    <div 
                      key={pattern.name} 
                      onClick={() => setActivePatternGuide(activePatternGuide === pattern.name ? null : pattern.name)}
                      className={`p-2.5 rounded bg-gray-500/5 text-xs hover:bg-gray-500/10 cursor-pointer transition-all border ${
                        activePatternGuide === pattern.name ? 'border-amber-500/40' : 'border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-start gap-2">
                          <span className="text-base">{pattern.symbol}</span>
                          <div>
                            <div className="font-bold">{pattern.name}</div>
                            <p className="opacity-70 text-[9px] mt-0.5">{pattern.desc}</p>
                          </div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">難度 {pattern.difficulty}</span>
                      </div>
                      
                      {/* 動態展示步驟說明 */}
                      {activePatternGuide === pattern.name && (
                        <div className="mt-3 pt-2.5 border-t border-gray-800/40 space-y-1.5 text-[10px] text-gray-300 animate-slideDown">
                          <div className="font-semibold text-amber-500 mb-1">📝 禪繞畫師步驟解析：</div>
                          {pattern.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-1">
                              <span className="text-amber-500 font-bold">{idx + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 中間：畫布核心區域 (5 columns) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              
              {/* 畫布控制頂欄 */}
              <div className="w-full flex justify-between items-center mb-3 text-xs flex-wrap gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={historyPointer <= 0}
                    className={`p-2 rounded-lg flex items-center gap-1 ${
                      historyPointer > 0 
                        ? 'bg-gray-500/15 hover:bg-gray-500/25 text-gray-200' 
                        : 'opacity-40 cursor-not-allowed text-gray-500'
                    }`}
                    title="復原一筆"
                  >
                    <Undo className="w-3.5 h-3.5" />
                    <span>復原</span>
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重畫</span>
                  </button>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  {/* 度量比例線 Toggle */}
                  <button
                    onClick={() => setShowTikseGrid(!showTikseGrid)}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      showTikseGrid 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                        : 'bg-gray-500/10 text-gray-400'
                    }`}
                    title="開啟西藏比例網格"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>比例網格</span>
                  </button>

                  {/* 底稿開關與透明度 */}
                  <div className="flex items-center gap-1 bg-gray-500/10 px-2.5 py-1.5 rounded-lg">
                    <button
                      onClick={() => setShowDraft(!showDraft)}
                      className="text-gray-300 hover:text-white"
                      title={showDraft ? "隱藏底稿" : "顯示底稿"}
                    >
                      {showDraft ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <span className="text-[10px] ml-1 opacity-75 hidden sm:inline">底稿透明度:</span>
                    <input 
                      type="range" 
                      min="5" 
                      max="85" 
                      step="5"
                      value={draftOpacity * 100}
                      onChange={(e) => setDraftOpacity(Number(e.target.value) / 100)}
                      className="w-14 accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 畫布主容器 (底稿、比例尺與手繪同軸重疊) */}
              <div 
                id="canvas-container"
                className={`relative rounded-3xl border overflow-hidden transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-[#0F101A] border-gray-800 shadow-2xl shadow-black/60' 
                    : 'bg-white border-gray-300 shadow-xl'
                }`}
                style={{ width: canvasSize, height: canvasSize }}
              >
                
                {/* A. 度量比例線圖層 (Tikse) */}
                {showTikseGrid && (
                  <div className="absolute inset-0 pointer-events-none z-5">
                    <svg 
                      viewBox={`0 0 ${canvasSize} ${canvasSize}`}
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: renderTikseOverlay(canvasSize) }}
                    />
                  </div>
                )}

                {/* B. 底稿引導圖層 (SVG 渲染) */}
                {showDraft && (
                  <div 
                    className="absolute inset-0 pointer-events-none z-10 transition-opacity"
                    style={{ opacity: draftOpacity }}
                  >
                    <svg 
                      viewBox={`0 0 ${canvasSize} ${canvasSize}`}
                      className={`w-full h-full ${isDarkMode ? 'text-amber-500' : 'text-slate-900'}`}
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.renderGuides(canvasSize) }}
                    />
                  </div>
                )}

                {/* C. 手繪畫布圖層 */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 z-20 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>

              {/* 下載與歸檔設定面板 */}
              <div className="w-full mt-4 space-y-3 bg-gray-500/5 p-4 rounded-2xl border border-gray-800/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-400">藝術品裝框選項:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-amber-400">
                    <input 
                      type="checkbox" 
                      checked={exportWithBrocade}
                      onChange={(e) => setExportWithBrocade(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span>加裝吉祥織錦外框 (五彩織錦)</span>
                  </label>
                </div>
                
                <button
                  onClick={handleExport}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm tracking-widest hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15"
                >
                  <Download className="w-4 h-4" />
                  保存當下覺照 (合併底稿高解析導出)
                </button>
              </div>

            </div>

            {/* 右側：正念呼吸引導與神聖法器 (3 columns) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* 正念呼吸大師 (Breathing Mentor) */}
              <div className={`p-5 rounded-2xl border text-center ${
                isDarkMode 
                  ? 'bg-gradient-to-b from-[#0E1018] to-[#131623] border-gray-800' 
                  : 'bg-gradient-to-b from-amber-50/40 to-stone-50 border-gray-200'
              }`}>
                <h4 className="text-xs font-bold tracking-widest text-amber-500 uppercase mb-3 flex items-center justify-center gap-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  正念呼吸儀式
                </h4>
                
                {/* 動態呼吸環 */}
                <div className="relative w-32 h-32 mx-auto my-4 flex items-center justify-center">
                  <div 
                    className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/20 transition-all duration-[1000ms] ease-in-out"
                    style={{
                      transform: `scale(${
                        breathState === '吸氣' ? 1.25 : 
                        breathState === '吐氣' ? 0.85 : 1.0
                      })`
                    }}
                  />
                  
                  <div 
                    className="w-24 h-24 rounded-full border-2 border-dashed border-amber-400 flex flex-col items-center justify-center p-2 transition-all duration-[4000ms]"
                    style={{ transform: `rotate(${breathProgress * 3.6}deg)` }}
                  >
                    <span className="text-xs font-serif font-bold tracking-wider">{breathState}</span>
                  </div>

                  <svg className="absolute inset-0 transform -rotate-90 w-full h-full pointer-events-none">
                    <circle cx="64" cy="64" r="54" stroke="currentColor" className="text-amber-500/10" strokeWidth="2" fill="none" />
                    <circle 
                      cx="64" cy="64" r="54" 
                      stroke="currentColor" 
                      className="text-amber-500 transition-all duration-100"
                      strokeWidth="3.5" 
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={2 * Math.PI * 54 * (1 - breathProgress / 100)}
                      fill="none" 
                    />
                  </svg>
                </div>

                <p className="text-xs text-gray-400 mt-2 italic leading-relaxed">
                  「吸氣時，感知筆尖與心意合一；<br/>
                  吐氣時，雜念化為畫布上的金絲。」
                </p>
              </div>

              {/* 禪修心意統計數據 (Zen Metrics) (NEW) */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0E1018]/90 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h4 className="text-xs font-bold tracking-widest text-amber-500 uppercase mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  當下禪修軌跡
                </h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-gray-500/5 p-2 rounded-xl">
                    <div className="text-xs opacity-65">累計筆劃</div>
                    <div className="text-lg font-bold text-amber-400 mt-0.5">{strokeCount} 筆</div>
                  </div>
                  <div className="bg-gray-500/5 p-2 rounded-xl">
                    <div className="text-xs opacity-65">專注時長</div>
                    <div className="text-lg font-bold text-amber-400 mt-0.5">{activeZenMinutes} 分鐘</div>
                  </div>
                </div>
                <div className="text-[10px] text-center mt-3 text-gray-500">
                  「不計快慢，一筆一畫皆是功德。」
                </div>
              </div>

              {/* 作畫提示與常識科普 */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0E1018]/90 border-gray-800' : 'bg-white border-gray-200'} text-xs leading-relaxed space-y-3`}>
                <div className="flex items-center gap-1 text-amber-500 font-bold font-serif mb-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>禪繞唐卡修持心法</span>
                </div>
                <p className="opacity-80">
                  <strong>一筆一畫原則：</strong> 禪繞唐卡的世界裡沒有「錯誤」。如果不小心畫歪了，不要急於擦掉，這正是您的自性流露。順著歪掉的弧度向外重複描摹出新的花紋，它便會化為一朵特別的祥雲。
                </p>
                <p className="opacity-80">
                  <strong>結合度量 Tikse：</strong> 中世紀唐卡大師使用炭筆比例線。若覺得線條難以定位，開啟「比例網格」對齊中心與象限，手繪對稱將更完美。
                </p>
              </div>

            </div>

          </div>
        </main>
      )}

      {/* 底部導航 & 禪意語錄 */}
      <footer className={`border-t mt-20 py-8 text-center text-xs opacity-60 ${isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-600'}`}>
        <p className="font-serif italic mb-2">"Anything is possible, one stroke at a time. 一筆一畫，皆是宇宙的圓滿。"</p>
        <p>© 2026 Mindful Canvas 覺知畫布. 專注、靜心、當下的力量.</p>
      </footer>
    </div>
  );
}