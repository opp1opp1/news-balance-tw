export interface SourceStyle {
  bg: string;
  text: string;
  border: string;
}

const COLOR_MAP: Record<string, SourceStyle> = {
  // 深綠 (Deep Green)
  '自由時報': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  '自由': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  'LTN': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  '民視': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  '三立': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  'SETN': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Newtalk': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  '新頭殼': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  
  // 淺綠 (Light Green)
  '華視': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  'CTS': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  '鏡週刊': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  'Mirror': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  
  // 淺藍 (Light Blue)
  '聯合報': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  '聯合新聞網': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  'UDN': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  'TVBS': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  '東森': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' }, // Changed to Light Blue
  'ETtoday': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' }, // Changed to Light Blue
  'NOWnews': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  '今日新聞': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },

  // 深藍 (Deep Blue)
  '中國時報': { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },
  '中時': { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },
  '中時新聞網': { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },
  'Chinatimes': { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },
  '中天': { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },
  '中視': { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },
  '風傳媒': { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },
  'Storm': { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },

  // 紅色 (Red - China/State Media)
  '新華': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '人民日報': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '環球時報': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '觀察者': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '中評': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  'CRNTT': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '台海網': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  '大公報': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },

  // 國際 (International - Purple)
  'CNN': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'BBC': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'Reuters': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'WSJ': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'Bloomberg': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },

  // 中立/其他 (Neutral/Gray)
  '公視': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'PTS': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  '中央社': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'CNA': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'Yahoo': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' }, // Yahoo neutral/aggregator
  'Google': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

const DEFAULT_STYLE: SourceStyle = { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };

export function getSourceStyle(sourceName: string): SourceStyle {
  // Normalize source name (remove spaces, lowercase for check)
  // But match against original keys
  for (const key in COLOR_MAP) {
    if (sourceName.includes(key)) {
      return COLOR_MAP[key];
    }
  }
  return DEFAULT_STYLE;
}