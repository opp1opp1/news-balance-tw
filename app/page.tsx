import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchAllNews } from "@/lib/fetcher";
import { clusterNews, synthesizeNews } from "@/lib/llm";
import { ExternalLink, Newspaper, Scale, AlertCircle, Sparkles, Zap, Target } from "lucide-react";
import { NewsItem } from "@/lib/types";
import { getSourceStyle } from "@/lib/colors";

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
  let unclusteredNews: NewsItem[] = [...allNews];
  let isClusteringCached = false;

  if (hasApiKey) {
    const newsToCluster = allNews.slice(0, 80);
    const clusters = await clusterNews(newsToCluster);
    isClusteringCached = clusters.length > 0 && clusters[0].isCached === true;
    
    const topClusters = clusters.slice(0, 5); 
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
        
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">熱門話題觀點平衡</h2>
              {isClusteringCached && (
                <Badge variant="outline" className="text-[10px] h-5 bg-blue-50 text-blue-600 border-blue-200 gap-1">
                  <Target className="h-3 w-3" /> 分群快取中
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-4">
               <span>已為您整理 {clusteredTopics.length} 則熱門焦點</span>
               <div className="flex gap-2">
                 <div className="flex items-center gap-1 text-[10px] font-medium"><Target className="h-3 w-3 text-blue-500"/> 快取</div>
                 <div className="flex items-center gap-1 text-[10px] font-medium"><Zap className="h-3 w-3 text-orange-500"/> 即時</div>
               </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {clusteredTopics.map((topicData, idx) => {
              const { synthesis, originalArticles } = topicData;
              const isCached = synthesis.isCached;
              return (
                <Card key={idx} className={`border-l-4 ${isCached ? 'border-l-blue-400' : 'border-l-orange-400'} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
                  <div className="absolute top-2 right-2">
                    {isCached ? (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 gap-1 py-0 px-2 h-6">
                        <Target className="h-3 w-3" /> 快取內容
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100 gap-1 py-0 px-2 h-6 animate-pulse">
                        <Zap className="h-3 w-3" /> 即時分析
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mr-24">
                      <CardTitle className="text-xl md:text-2xl">{synthesis.title}</CardTitle>
                      <Badge variant="secondary" className="w-fit">{topicData.topic}</Badge>
                    </div>
                    <CardDescription className="text-base mt-2">
                      {synthesis.summary}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-7 space-y-3">
                       <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2 border-b pb-1">
                         <Scale className="h-4 w-4" /> 各方觀點差異
                       </h3>
                       <div className="space-y-3">
                        {synthesis.viewpointDifferences.map((vp: any, i: number) => {
                          const style = getSourceStyle(vp.source);
                          return (
                            <div key={i} className={`text-sm p-3 rounded border-l-4 ${style.bg} ${style.text} ${style.border}`}>
                              <span className="font-bold mr-2 uppercase">{vp.source}:</span>
                              <span className="leading-relaxed">{vp.viewpoint}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="md:col-span-5 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border">
                      <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2 border-b pb-1">
                        <Newspaper className="h-4 w-4" /> 原始報導 ({originalArticles.length})
                      </h3>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                        {originalArticles.map((article, i) => {
                          const style = getSourceStyle(article.source);
                          return (
                            <a key={i} href={article.link} target="_blank" rel="noreferrer" className="block group">
                              <div className="flex items-start gap-2 p-2 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200">
                                 <Badge className={`shrink-0 text-[10px] px-1.5 py-0 h-5 border ${style.bg} ${style.text} ${style.border}`}>
                                    {article.source}
                                 </Badge>
                                 <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-primary leading-tight">
                                   {article.title}
                                 </span>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/80 dark:bg-slate-900/50 p-6 border-t flex flex-col gap-4">
                        <div className="prose dark:prose-invert max-w-none w-full">
                           <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                             <Sparkles className="h-3 w-3" /> 平衡全文
                           </h4>
                           <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed text-justify text-sm md:text-base">
                             {synthesis.balancedContent}
                           </p>
                        </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-muted-foreground">其他最新快訊</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {unclusteredNews.slice(0, 24).map((item, i) => {
              const style = getSourceStyle(item.source);
              return (
                <Card key={i} className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 border-dashed hover:border-solid transition-all">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start mb-2">
                       <Badge className={`text-[10px] px-1 h-5 border ${style.bg} ${style.text} ${style.border}`}>
                        {item.source}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">{new Date(item.pubDate).toLocaleDateString()}</span>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                      閱讀 <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
