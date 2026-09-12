export type LiveFare = { carrier: string; flight: number; stops: number };
let tokenCache: { token: string; expires: number } | null = null;

async function token() {
  if (tokenCache && tokenCache.expires > Date.now()) return tokenCache.token;
  const id = process.env.AMADEUS_CLIENT_ID;
  const secret = process.env.AMADEUS_CLIENT_SECRET;
  if (!id || !secret) return null;
  const base = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
  const res = await fetch(`${base}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({grant_type:'client_credentials',client_id:id,client_secret:secret}),
    cache: 'no-store',
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const json = await res.json() as {access_token:string;expires_in:number};
  tokenCache = {token:json.access_token, expires:Date.now() + Math.max(60, json.expires_in - 60) * 1000};
  return tokenCache.token;
}

export async function getLiveFare(args: {origin:string; destination:string; departure:string; returnDate:string|null; adults:number; children:number}): Promise<LiveFare|null> {
  const accessToken = await token();
  if (!accessToken) return null;
  const base = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
  const query = new URLSearchParams({
    originLocationCode: args.origin,
    destinationLocationCode: args.destination,
    departureDate: args.departure,
    adults: String(Math.max(1,args.adults)),
    currencyCode: 'SAR',
    max: '8'
  });
  if (args.children > 0) query.set('children', String(args.children));
  if (args.returnDate) query.set('returnDate', args.returnDate);
  try {
    const res = await fetch(`${base}/v2/shopping/flight-offers?${query}`, {
      headers: {Authorization:`Bearer ${accessToken}`},
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json() as any;
    const offers = Array.isArray(json.data) ? json.data : [];
    if (!offers.length) return null;
    const best = offers
      .map((offer:any) => ({
        carrier: offer.validatingAirlineCodes?.[0] || offer.itineraries?.[0]?.segments?.[0]?.carrierCode || 'Airline',
        flight: Math.round(Number(offer.price?.grandTotal || offer.price?.total || 0)),
        stops: Math.max(0, ...((offer.itineraries || []).map((i:any)=>Math.max(0,(i.segments?.length || 1)-1))))
      }))
      .filter((x:any)=>Number.isFinite(x.flight) && x.flight > 0)
      .sort((a:any,b:any)=>a.flight-b.flight)[0];
    return best || null;
  } catch {
    return null;
  }
}
