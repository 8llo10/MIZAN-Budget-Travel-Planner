import { uniqueDestinations } from './destinations';
import type { Destination, SearchInput, SpendStyle, TripResult } from './types';
import type { FxSnapshot } from './fx';
import { getLiveFare } from './providers/amadeus';

const hash = (s:string) => [...s].reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0);
const addDays = (date:string,n:number) => { const d=new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); };
const styleMultiplier: Record<SpendStyle, number> = { smart: .78, balanced: 1, comfort: 1.38 };

function routeBase(origin:string, destination:Destination, departure:string) {
  const seed = Math.abs(hash(`${origin}:${destination.iata}:${departure}`));
  const regionBase = destination.region === 'Saudi Arabia' ? 180 : destination.region === 'GCC' ? 420 : 620;
  const weekday = new Date(`${departure}T12:00:00Z`).getUTCDay();
  const weekendFactor = [4,5,6].includes(weekday) ? 1.12 : .96;
  const month = Number(departure.slice(5,7));
  const seasonFactor = [6,7,8,12].includes(month) ? 1.14 : [1,2,9].includes(month) ? .94 : 1;
  return Math.round((regionBase + (seed % (destination.region === 'Arab World' ? 720 : 430))) * weekendFactor * seasonFactor);
}

function referenceFare(input:SearchInput,destination:Destination,departure:string) {
  const travelers = input.adults + input.children;
  const adultFare = routeBase(input.origin,destination,departure);
  const childFare = Math.round(adultFare * .78);
  const tripFactor = input.tripType === 'round' ? 1.68 : 1;
  const flight = Math.round((adultFare * input.adults + childFare * input.children) * tripFactor);
  const seed = Math.abs(hash(`${destination.iata}:${departure}:carrier`));
  const carriers = destination.region === 'Saudi Arabia'
    ? ['SAUDIA','flynas','flyadeal']
    : ['SAUDIA','flynas','Qatar Airways','Emirates','Gulf Air','Air Arabia','Royal Jordanian','EgyptAir'];
  return {carrier:carriers[seed%carriers.length],flight,stops:destination.region==='Arab World' && seed%5===0?1:0, travelers};
}

function costFor(input:SearchInput,destination:Destination,departure:string,fx:FxSnapshot,flightOverride?:{carrier:string;flight:number;stops:number}|null): TripResult {
  const travelers = input.adults + input.children;
  const rooms = Math.max(1, Math.ceil(travelers / 2));
  const nights = input.tripType === 'round' ? Math.max(1,input.days-1) : Math.max(0,input.days-1);
  const factor = styleMultiplier[input.spendStyle];
  const sarPerUnit = fx.sarPerUnit[destination.currency] || 1;
  const ref = referenceFare(input,destination,departure);
  const fare = flightOverride || ref;
  const hotel = input.includeHotel ? Math.round(destination.hotelNight * sarPerUnit * nights * rooms * factor) : 0;
  const food = input.includeFood ? Math.round(destination.dailyFood * sarPerUnit * input.days * (input.adults + input.children*.65) * factor) : 0;
  const local = input.includeLocal ? Math.round(destination.dailyLocal * sarPerUnit * input.days * Math.max(1,travelers*.72) * factor) : 0;
  const activities = input.includeActivities ? Math.round(destination.dailyActivities * sarPerUnit * input.days * (input.adults + input.children*.6) * factor) : 0;
  const total = fare.flight + hotel + food + local + activities;
  const remaining = input.budget - total;
  const usage = input.budget > 0 ? total/input.budget : 99;
  const within = remaining >= 0;
  const score = Math.round((within ? 100 : 40) - Math.abs(1-usage)*30 - fare.stops*3 + (fare === flightOverride ? 4 : 0));
  return {
    ...destination,
    departure,
    returnDate: input.tripType === 'round' ? addDays(departure,input.days) : null,
    carrier: fare.carrier,
    stops: fare.stops,
    liveFare: Boolean(flightOverride),
    costs:{flight:fare.flight,hotel,food,local,activities,total,perPerson:Math.round(total/Math.max(1,travelers))},
    remaining, within, budgetUsage:Math.round(usage*100), score,
    rooms, travelers, nativeCurrency:destination.currency, fxRateToSar:sarPerUnit,
  };
}

export async function searchTrips(input:SearchInput,fx:FxSnapshot) {
  const candidates = uniqueDestinations.filter(d =>
    d.iata !== input.origin &&
    (!input.destination || d.iata === input.destination) &&
    (!input.region || input.region === 'ALL' || d.region === input.region)
  );
  const offsets = Array.from({length:Math.min(15,input.flexDays*2+1)},(_,i)=>i-input.flexDays);
  const baseResults = candidates.flatMap(destination => offsets.map(offset => costFor(input,destination,addDays(input.startDate,offset),fx)));
  let source:'live+reference'|'reference' = 'reference';

  if (input.destination && process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
    const targets = baseResults.slice(0,Math.min(7,baseResults.length));
    const live = await Promise.all(targets.map(async item => {
      const fare = await getLiveFare({origin:input.origin,destination:item.iata,departure:item.departure,returnDate:item.returnDate,adults:input.adults,children:input.children});
      return fare ? costFor(input,item,item.departure,fx,fare) : item;
    }));
    baseResults.splice(0,live.length,...live);
    if (live.some(x=>x.liveFare)) source='live+reference';
  }

  const sorted = baseResults.sort((a,b)=>{
    if (a.within !== b.within) return a.within ? -1 : 1;
    if (a.within && b.within) return b.score-a.score || b.remaining-a.remaining;
    return a.costs.total-b.costs.total;
  });

  const perDestination = new Map<string,TripResult[]>();
  for (const item of sorted) {
    const list = perDestination.get(item.iata) || [];
    if (list.length < (input.destination ? 12 : 2)) list.push(item);
    perDestination.set(item.iata,list);
  }
  return {results:Array.from(perDestination.values()).flat().slice(0,30),source};
}
