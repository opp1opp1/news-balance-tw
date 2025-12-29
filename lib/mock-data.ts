import { NewsItem, SynthesisResult } from './types';

export const MOCK_SYNTHESIS: SynthesisResult = {
  title: "AI 綜合報導：2025 台北捷運新線通車爭議",
  summary: "台北捷運新路線於昨日正式通車，緩解了內湖地區的交通壓力，但也引發了關於票價調整的熱烈討論。市府強調使用者付費，而反對黨則批評這是變相漲價。",
  factList: [
    "新路線全長 15 公里，共設 10 個車站。",
    "通車首日運量達到 5 萬人次。",
    "票價較現有路線平均高出 5 元。"
  ],
  viewpointDifferences: [
    {
      source: "市府/官方",
      viewpoint: "強調建設成本高昂，票價調整是為了維持營運品質與財務永續。"
    },
    {
      source: "反對黨/民團",
      viewpoint: "認為公共運輸應以服務為導向，漲價將增加通勤族負擔，並可能降低搭乘意願。"
    }
  ],
  balancedContent: "（這裡是長篇的平衡報導內容...）台北捷運新路線的開通無疑是城市發展的重要里程碑。根據官方數據，首日運量符合預期，有效分流了尖峰時刻的人潮。然而，票價議題成為了通車典禮後的焦點。市府方面表示...（略）...另一方面，反對聲音指出...（略）...專家建議，應觀察三個月後的長期運量變化再做定論。"
};

export const MOCK_NEWS_ITEMS: NewsItem[] = [
  {
    title: "北捷新線通車 蔣市長：實現對市民承諾",
    link: "#",
    pubDate: "2025-12-28 10:00:00",
    source: "聯合報",
    content: "..."
  },
  {
    title: "票價調漲惹民怨 議員痛批：把市民當提款機",
    link: "#",
    pubDate: "2025-12-28 11:30:00",
    source: "自由時報",
    content: "..."
  },
  {
    title: "捷運新線今通車 路線圖與票價懶人包",
    link: "#",
    pubDate: "2025-12-28 09:00:00",
    source: "公視新聞",
    content: "..."
  }
];
