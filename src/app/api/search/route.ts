import { NextResponse } from 'next/server';
import { getFxSnapshot } from '@/lib/fx';
import { searchTrips } from '@/lib/pricing';
import type { SearchInput } from '@/lib/types';

function isValid(body: Partial<SearchInput>) {
  const dateMode = body.dateMode || 'anytime';
  const hasDate = dateMode === 'anytime' || Boolean(body.startDate);
  return Boolean(body.origin && hasDate && Number(body.budget) > 0 && Number(body.adults) >= 1 && Number(body.days) >= 1);
}

export async function POST(req:Request) {
  try {
    const body = await req.json() as SearchInput;
    if (!isValid(body)) return NextResponse.json({error:'Please complete the required trip details.'},{status:400});

    const fx = await getFxSnapshot();
    const currency = body.currency || 'SAR';
    const sarPerUnit = fx.sarPerUnit[currency] || 1;
    const enteredBudget = Math.max(1, Math.min(1_000_000, Number(body.budget)));
    const budgetSar = enteredBudget * sarPerUnit;
    const allowedMonths = [1,3,6,12] as const;
    const requestedMonths = Number(body.searchMonths || 12);
    const searchMonths = (allowedMonths.includes(requestedMonths as 1|3|6|12) ? requestedMonths : 12) as 1|3|6|12;

    const input: SearchInput = {
      ...body,
      dateMode: body.dateMode === 'specific' ? 'specific' : 'anytime',
      searchMonths,
      currency,
      budget: budgetSar,
      adults: Math.min(20,Math.max(1,Number(body.adults))),
      children: Math.min(20,Math.max(0,Number(body.children || 0))),
      days: Math.min(60,Math.max(1,Number(body.days))),
      flexDays: Math.min(14,Math.max(0,Number(body.flexDays || 0))),
    };

    const search = await searchTrips(input,fx);
    return NextResponse.json({
      ...search,
      budget:{entered:enteredBudget,currency,sar:budgetSar},
      fx:{source:fx.source,updatedAt:fx.updatedAt,sarPerUnit:fx.sarPerUnit}
    });
  } catch {
    return NextResponse.json({error:'We could not calculate this trip right now.'},{status:500});
  }
}
