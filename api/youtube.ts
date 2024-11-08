import { Innertube } from 'youtubei.js';
import cors from '../lib/cors';

export const config = {
  runtime: 'edge',
}

export async function search(q: string) {
  try {

    const youtube = await Innertube.create();

    const result = await youtube.search(q, { type: 'video', sort_by: 'relevance' });

    // filter out videos without duration (live?), then get first 10 videos
    const videos = result.videos.filter((item) => item.duration?.seconds).slice(0, 10);

    return videos.map((item) => {
      return {
        title: item.title.text ?? 'Untitled',
        thumbnail: item.thumbnails,
        id: item.id,
        duration: item.duration?.seconds ?? -1,
        author: {
          name: item.author.name,
          thumbnails: item.author.thumbnails,
          url: item.author.url,
        },
        view_count: item.view_count.text,
        published: item.published.text,
      }
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return cors(req, new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    }));
  }

  const data = await search(q);

  if (!data) {
    return cors(req, new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    }));
  }


  return cors(req, new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  }));
}