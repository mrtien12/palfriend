import { NextRequest, NextResponse } from "next/server";
import { Redis } from '@upstash/redis';

export async function POST(request: NextRequest) {
    const input = await request.json();
    const redis = new Redis({
        url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL,
        token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN,
      })
    const result = await redis.del(input.sessionId);
    
    return NextResponse.json(result);
}