export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content?: string;
  source: string; // 'PTS' | 'UDN' | 'LTN' etc.
  guid?: string;
}

export interface ViewpointDifference {
  source: string;
  viewpoint: string;
}

export interface SynthesisResult {
  title: string;
  summary: string;
  factList: string[];
  viewpointDifferences: ViewpointDifference[];
  balancedContent: string;
}

export interface NewsCluster {
  topic: string;
  articleIndices: number[]; // Index in the original fetched array
  mainCategory: string; // e.g., "Politics", "Economy"
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  rssUrl: string;
}
