import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Newspaper, Scale, AlertCircle, Sparkles, Zap, Target, ChevronDown, Clock } from "lucide-react";
import { getSourceStyle } from "@/lib/colors";
import Link from "next/link";
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home(props: Props) {
  const searchParams = await props.searchParams;
  const limitParam = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 5;
  const currentLimit = isNaN(limitParam) ? 5 : Math.min(Math.max(limitParam, 5), 20);

  // Read data from static report file
  const dataFilePath = path.join(process.cwd(), 'data', 'latest-report.json');
  let reportData = null;

  if (fs.existsSync(dataFilePath)) {
    try {
      const rawData = fs.readFileSync(dataFilePath, 'utf-8');
      reportData = JSON.parse(rawData);
    } catch (e) {
      console.error("Error reading report data", e);
    }
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
        <Sparkles className="h-16 w-16 text-primary animate-pulse" />
        <h1 className="text-2xl font-bold">系統正在初始化分析</h1>
        <p className="text-muted-foreground text-center max-w-md">
          請稍候，後端正在進行首次全網新聞掃描與 AI 觀點平衡分析。<br/>
          (請執行 `npm run update-news` 來生成報告)
        </p>
      </div>
    );
  }

  const { clusteredTopics, unclusteredNews, updatedAt } = reportData;
  const displayTopics = clusteredTopics.slice(0, currentLimit);
  const hasMoreClusters = clusteredTopics.length > currentLimit;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4 justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Scale className="h-6 w-6 text-primary" />
            <span>Taiwan News Balancer</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
             <Clock className="h-3 w-3" />
             更新於: {new Date(updatedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })} (Taiwan)
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 space-y-10">
        
        {/* Hot Topics Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">熱門話題觀點平衡</h2>
            </div>
            <div className="text-sm text-muted-foreground">
               已為您整理 {clusteredTopics.length} 則熱門焦點
            </div>
          </div>
          
          <div className="space-y-8">
            {displayTopics.map((topicData: any, idx: number) => {
              const { synthesis, originalArticles } = topicData;
              // Data from static file is considered "Cached" effectively
              const isCached = true; 
              
              return (
                <Card key={idx} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                     <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 gap-1 py-0 px-2 h-6">
                        <Target className="h-3 w-3" /> AI 綜合分析
                      </Badge>
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
                        {originalArticles.map((article: any, i: number) => {
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
            
            {/* Load More Button */}
            {hasMoreClusters && (
               <div className="flex justify-center pt-4">
                 <Button variant="outline" size="lg" className="w-full md:w-1/3 gap-2" asChild>
                   <Link href={`/?limit=${currentLimit + 5}`} scroll={false}>
                     <ChevronDown className="h-4 w-4" />
                     載入更多話題 ({Math.min(clusteredTopics.length, currentLimit + 5)})
                   </Link>
                 </Button>
               </div>
            )}
          </div>
        </section>

        <Separator />

        {/* Other News Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-muted-foreground">其他最新快訊</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {unclusteredNews.slice(0, 40).map((item: any, i: number) => {
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
