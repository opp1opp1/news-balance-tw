import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchAllNews } from "@/lib/fetcher";
import { synthesizeNews } from "@/lib/llm";
import { ExternalLink, Newspaper, Scale, AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic'; // 確保每次載入都是最新資料

export default async function Home() {
  const allNews = await fetchAllNews();
  
  // 如果沒有新聞，顯示錯誤
  if (allNews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold">無法抓取新聞</h1>
        <p className="text-muted-foreground">請檢查網路連線或 RSS 來源是否正常。</p>
      </div>
    );
  }

  // 選取前 5 篇作為分析主題（實務上可以做關鍵字分群，這裡先簡化處理）
  const topNewsForAnalysis = allNews.slice(0, 5);
  const synthesis = await synthesizeNews("今日台灣頭條焦點", topNewsForAnalysis);

  const hasApiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Scale className="h-6 w-6 text-primary" />
            <span>Taiwan News Balancer</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 space-y-8">
        
        {/* AI Synthesis Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary">AI 觀點平衡報導</Badge>
            <span className="text-sm text-muted-foreground">
              {hasApiKey ? "分析自多方媒體來源" : "⚠️ 請在 .env.local 設定 API Key 以啟用分析"}
            </span>
          </div>
          
          {synthesis ? (
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl leading-tight">{synthesis.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {synthesis.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                
                {/* Facts */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded text-sm">核心事實</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {synthesis.factList.map((fact, i) => (
                      <li key={i}>{fact}</li>
                    ))}
                  </ul>
                </div>

                {/* Viewpoints */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded text-sm">觀點差異分析</span>
                  </h3>
                  <div className="space-y-3">
                    {synthesis.viewpointDifferences.map((vp, i) => (
                      <div key={i} className="text-sm bg-slate-100 dark:bg-slate-900 p-3 rounded-md">
                        <span className="font-bold block mb-1">{vp.source}</span>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{vp.viewpoint}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t">
                <div className="prose dark:prose-invert max-w-none w-full">
                   <h4 className="text-lg font-bold mb-2">平衡全文</h4>
                   <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                     {synthesis.balancedContent}
                   </p>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="p-8 text-center bg-slate-100 dark:bg-slate-900 border-dashed">
              <p className="text-muted-foreground italic">
                {hasApiKey ? "正在準備觀點分析..." : "尚未連線至 LLM。請設定 GOOGLE_GENERATIVE_AI_API_KEY。"}
              </p>
            </Card>
          )}
        </section>

        <Separator />

        {/* Source Articles Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            今日原始報導
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allNews.slice(0, 12).map((item, i) => (
              <Card key={i} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={
                      item.source.includes('聯合') ? 'destructive' : 
                      item.source.includes('自由') ? 'default' : 'secondary'
                    }>
                      {item.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{new Date(item.pubDate).toLocaleTimeString()}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-2">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.content}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button variant="ghost" size="sm" className="w-full gap-2 text-primary" asChild>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                      閱讀原文
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
