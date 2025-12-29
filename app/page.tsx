import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchAllNews } from "@/lib/fetcher";
import { clusterNews, synthesizeNews } from "@/lib/llm";
import { ExternalLink, Newspaper, Scale, AlertCircle, Sparkles } from "lucide-react";
import { NewsItem } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const allNews = await fetchAllNews();
  
  if (allNews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold">無法抓取新聞</h1>
        <p className="text-muted-foreground">請檢查網路連線或 RSS 來源是否正常。</p>
      </div>
    );
  }

  const hasApiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  let clusteredTopics: { synthesis: any, originalArticles: NewsItem[], topic: string }[] = [];
  let unclusteredNews: NewsItem[] = [...allNews]; // Start with all, remove clustered ones later

  if (hasApiKey) {
    // 1. Cluster first 80 articles
    const newsToCluster = allNews.slice(0, 80);
    const clusters = await clusterNews(newsToCluster);
    
    // 2. Synthesize top 5 clusters
    // Increased back to 5 as we now have caching and fallback mechanisms
    const topClusters = clusters.slice(0, 5); 
    
    // Identify clustered indices to remove them from "Other News"
    const clusteredIndices = new Set<number>();

    const synthesisPromises = topClusters.map(async (cluster) => {
      cluster.articleIndices.forEach(idx => clusteredIndices.add(idx));
      
      const clusterArticles = cluster.articleIndices
        .map(index => newsToCluster[index])
        .filter(Boolean);

      if (clusterArticles.length > 0) {
        try {
          const result = await synthesizeNews(cluster.topic, clusterArticles);
          if (result) return { synthesis: result, originalArticles: clusterArticles, topic: cluster.topic };
        } catch (e) {
          console.error("Synthesis failed for topic:", cluster.topic, e);
          return null;
        }
      }
      return null;
    });

    const results = await Promise.all(synthesisPromises);
    clusteredTopics = results.filter((item): item is NonNullable<typeof item> => item !== null && item.synthesis !== null);
    
    // Filter out clustered news from the main list (approximate matching by title/link if indices shift, but here indices are from slice 0-80)
    // Actually, simpler way: create a new list excluding those indices.
    unclusteredNews = allNews.filter((_, idx) => !clusteredIndices.has(idx));
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Scale className="h-6 w-6 text-primary" />
            <span>Taiwan News Balancer</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 space-y-10">
        
        {/* Topic Feed (Clustered & Synthesized) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">熱門話題觀點平衡</h2>
            <span className="text-sm text-muted-foreground ml-2">
               {hasApiKey ? "AI 自動聚合與分析" : "請設定 API Key"}
            </span>
          </div>
          
          <div className="space-y-8">
            {clusteredTopics.map((topicData, idx) => {
              const { synthesis, originalArticles } = topicData;
              return (
                <Card key={idx} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <CardTitle className="text-xl md:text-2xl">{synthesis.title}</CardTitle>
                      <Badge variant="secondary" className="w-fit">{topicData.topic}</Badge>
                    </div>
                    <CardDescription className="text-base mt-2">
                      {synthesis.summary}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="grid md:grid-cols-12 gap-6">
                    {/* Viewpoint Differences (Highlight) - Span 7 cols */}
                    <div className="md:col-span-7 space-y-3">
                       <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                         <Scale className="h-4 w-4" /> 各方觀點差異
                       </h3>
                       <div className="space-y-3">
                        {synthesis.viewpointDifferences.map((vp: any, i: number) => (
                          <div key={i} className="text-sm bg-slate-100 dark:bg-slate-900 p-3 rounded border-l-2 border-slate-300 dark:border-slate-700">
                            <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">{vp.source}:</span>
                            <span className="text-slate-600 dark:text-slate-400">{vp.viewpoint}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Original Sources List - Span 5 cols */}
                    <div className="md:col-span-5 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border">
                      <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Newspaper className="h-4 w-4" /> 原始報導 ({originalArticles.length})
                      </h3>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                        {originalArticles.map((article, i) => (
                          <a key={i} href={article.link} target="_blank" rel="noreferrer" className="block group">
                            <div className="flex items-start gap-2 p-2 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors">
                               <Badge variant={article.source.includes('聯合') ? 'destructive' : article.source.includes('自由') ? 'default' : 'secondary'} 
                                      className="shrink-0 text-[10px] px-1 py-0 h-5">
                                  {article.source.substring(0, 2)}
                               </Badge>
                               <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-primary leading-tight">
                                 {article.title}
                               </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* Unclustered News Feed */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-muted-foreground">其他最新快訊</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {unclusteredNews.slice(0, 20).map((item, i) => (
              <Card key={i} className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 border-dashed hover:border-solid transition-all">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-400">
                      {item.source}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="p-4 pt-0 mt-auto">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 ml-auto">
                    閱讀 <ExternalLink className="h-3 w-3" />
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
