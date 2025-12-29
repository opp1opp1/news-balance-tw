import { NextResponse } from 'next/server';
import { fetchAllNews } from '@/lib/fetcher';

export async function GET() {
  try {
    const news = await fetchAllNews();
    return NextResponse.json({ 
      success: true,
      count: news.length, 
      sample: news.slice(0, 3) 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
