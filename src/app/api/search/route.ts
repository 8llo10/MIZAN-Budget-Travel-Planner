import { NextResponse } from 'next/server';
import { getFxSnapshot } from '@/lib/fx';
import { searchTrips } from '@/lib/pricing';
import type { SearchInput } from '@/lib/types';

function isValid(body: Partial<SearchInput>) {
  return Boolean(body.origin && body.startDate && Number(body.budget) > 0 && Number(body.adults) >= 1 && Number(body.days) >= 1);
}

export async function POST(req:Request) {
  try {
    const body = await req.json() as SearchInput;
    if (!isValid(body)) return NextResponse.json({error:'Please complete the required trip details.'},{status:400});
    const input: SearchInput = {
      ...body,
      budget: Math.min(500000,Math.max(100,Number(body.budget))),
      adults: Math.min(20,Math.max(1,Number(body.adults))),
      children: Math.min(20,Math.max(0,Number(body.children || 0))),
      days: Math.min(60,Math.max(1,Number(body.days))),
      flexDays: Math.min(7,Math.max(0,Number(body.flexDays || 0))),
    };
    const fx = await getFxSnapshot();
    const search = await searchTrips(input,fx);
    return NextResponse.json({...search,fx:{source:fx.source,updatedAt:fx.updatedAt}});
  } catch {
    return NextResponse.json({error:'We could not calculate this trip right now.'},{status:500});
  }
}
