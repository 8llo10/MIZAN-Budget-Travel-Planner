import { placeKey, uniqueDestinations } from './destinations';
import type { CostLine, Destination, SearchInput, SpendStyle, TripResult } from './types';
import type { FxSnapshot } from './fx';
import { getCheapestDates, getLiveFare } from './providers/amadeus';

const hash=(s:string)=>[...s].reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0);
const addDays=(date:string,n:number)=>{const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const today=()=>new Date().toISOString().slice(0,10);
const styleMultiplier:Record<SpendStyle,number>={smart:.78,balanced:1,comfort:1.38};
const essentialsDailySar:Record<Destination['region'],number>={'Saudi Arabia':18,GCC:24,'Arab World':20};
const pct=(n:number)=>Math.min(20,Math.max(0,Number.isFinite(n)?n:10));

function originPlace(input:SearchInput){return uniqueDestinations.find(d=>placeKey(d)===input.origin)||uniqueDestinations.find(d=>d.iata===input.origin)}
function routeBase(originAirport:string,destination:Destination,departure:string){
  if(originAirport===destination.iata)return 0;
  const seed=Math.abs(hash(`${originAirport}:${destination.iata}:${departure}`));
  const regionBase=destination.region==='Saudi Arabia'?180:destination.region==='GCC'?420:620;
  const weekday=new Date(`${departure}T12:00:00Z`).getUTCDay();
  const weekendFactor=[4,5,6].includes(weekday)?1.12:.96;
  const month=Number(departure.slice(5,7));
  const seasonFactor=[6,7,8,12].includes(month)?1.14:[1,2,9].includes(month)?.94:1;
  return Math.round((regionBase+(seed%(destination.region==='Arab World'?720:430)))*weekendFactor*seasonFactor);
}
function referenceFare(input:SearchInput,destination:Destination,departure:string){
  const origin=originPlace(input);const originAirport=origin?.iata||input.origin;
  if(originAirport===destination.iata)return{carrier:'Ground / local',flight:0,stops:0};
  const adultFare=routeBase(originAirport,destination,departure);const childFare=Math.round(adultFare*.78);const tripFactor=input.tripType==='round'?1.68:1;
  const flight=Math.round((adultFare*input.adults+childFare*input.children)*tripFactor);const seed=Math.abs(hash(`${destination.iata}:${departure}:carrier`));
  const carriers=destination.region==='Saudi Arabia'?['SAUDIA','flynas','flyadeal']:['SAUDIA','flynas','Qatar Airways','Emirates','Gulf Air','Air Arabia','Royal Jordanian','EgyptAir'];
  return{carrier:carriers[seed%carriers.length],flight,stops:destination.region==='Arab World'&&seed%5===0?1:0};
}
function costFor(input:SearchInput,destination:Destination,departure:string,fx:FxSnapshot,flightOverride?:{carrier:string;flight:number;stops:number}|null):TripResult{
  const travelers=input.adults+input.children;const rooms=Math.max(1,Math.ceil(travelers/2));const nights=Math.max(0,input.days-1);const factor=styleMultiplier[input.spendStyle];
  const sarPerUnit=fx.sarPerUnit[destination.currency]||1;const ref=referenceFare(input,destination,departure);const fare=flightOverride||ref;
  const hotelUnit=Math.round(destination.hotelNight*sarPerUnit*factor);const foodAdultUnit=Math.round(destination.dailyFood*sarPerUnit*factor);const localUnit=Math.round(destination.dailyLocal*sarPerUnit*factor);const activityUnit=Math.round(destination.dailyActivities*sarPerUnit*factor);
  const hotel=input.includeHotel?Math.round(hotelUnit*nights*rooms):0;
  const food=input.includeFood?Math.round(foodAdultUnit*input.days*(input.adults+input.children*.65)):0;
  const local=input.includeLocal?Math.round(localUnit*input.days*Math.max(1,travelers*.72)):0;
  const activities=input.includeActivities?Math.round(activityUnit*input.days*(input.adults+input.children*.6)):0;
  const essentialsUnit=Math.round(essentialsDailySar[destination.region]*factor);const essentials=input.includeEssentials===false?0:Math.round(essentialsUnit*input.days*(input.adults+input.children*.65));
  const coreTotal=fare.flight+hotel+food+local+activities+essentials;const emergencyPct=pct(input.emergencyPct??10);const emergency=Math.round(coreTotal*emergencyPct/100);const safeTotal=coreTotal+emergency;
  const total=coreTotal;const remaining=input.budget-total;const safeRemaining=input.budget-safeTotal;const usage=input.budget>0?total/input.budget:99;const within=remaining>=0;const safeWithin=safeRemaining>=0;
  const score=Math.round(100-Math.max(0,total-input.budget)/Math.max(1,input.budget)*30-fare.stops*3+(flightOverride?4:0));
  const costLines:CostLine[]=[
    {key:'flight',amount:fare.flight,confidence:flightOverride?'live':'reference',unitLabel:'trip',formula:flightOverride?'Provider fare for selected party and itinerary':'Reference route fare × party × trip type',basis:flightOverride?'Fare returned by the connected flight provider for this itinerary.':'Route, region, travel date/season, party composition and one-way/round-trip reference model.'},
    {key:'hotel',amount:hotel,confidence:'reference',unitAmount:hotelUnit,units:nights*rooms,unitLabel:'room-night',formula:`${nights} nights × ${rooms} room(s) × reference nightly rate`,basis:'Destination reference nightly accommodation rate, converted to SAR and adjusted by spending style. Not a live hotel quote.'},
    {key:'food',amount:food,confidence:'allowance',unitAmount:foodAdultUnit,units:input.days,unitLabel:'day',formula:`${input.days} days × ${input.adults} adult(s) + children at 65%`,basis:'Daily food planning allowance for the destination, adjusted by spending style. This is a budget allowance, not restaurant reservations.'},
    {key:'local',amount:local,confidence:'allowance',unitAmount:localUnit,units:input.days,unitLabel:'day',formula:`${input.days} days × party transport factor`,basis:'Daily local-transport allowance covering ordinary in-destination movement; private drivers and rental cars are separate add-ons.'},
    {key:'activities',amount:activities,confidence:'allowance',unitAmount:activityUnit,units:input.days,unitLabel:'day',formula:`${input.days} days × ${input.adults} adult(s) + children at 60%`,basis:'Daily experiences allowance based on destination reference level and spending style. It does not claim specific attractions are booked.'},
    {key:'essentials',amount:essentials,confidence:'allowance',unitAmount:essentialsUnit,units:input.days,unitLabel:'day',formula:`${input.days} days × party essentials factor`,basis:'Planning allowance for small travel necessities such as water and basic incidental needs. Internet, insurance, visas and premium services remain separate add-ons.'},
    {key:'emergency',amount:emergency,confidence:'allowance',unitAmount:emergencyPct,unitLabel:'%',formula:`${emergencyPct}% × core trip cost`,basis:'User-adjustable safety reserve. It is shown separately and is not counted as a purchased travel service.'}
  ];
  return{...destination,departure,returnDate:input.tripType==='round'?addDays(departure,Math.max(0,input.days-1)):null,carrier:fare.carrier,stops:fare.stops,liveFare:Boolean(flightOverride),costs:{flight:fare.flight,hotel,food,local,activities,essentials,coreTotal,emergency,safeTotal,total,perPerson:Math.round(total/Math.max(1,travelers))},costLines,remaining,safeRemaining,within,safeWithin,budgetUsage:Math.round(usage*100),score,rooms,days:input.days,nights,travelers,adultsCount:input.adults,childrenCount:input.children,spendStyleUsed:input.spendStyle,emergencyPct,nativeCurrency:destination.currency,fxRateToSar:sarPerUnit,methodologyVersion:'MIZAN-COST-2.0'};
}
function dateCandidates(input:SearchInput){if((input.dateMode||'anytime')==='anytime'){const months=input.searchMonths||12;const horizon=Math.min(359,Math.max(30,Math.round(months*30.4)));const first=addDays(today(),1);return Array.from({length:horizon},(_,i)=>addDays(first,i))}const base=input.startDate||addDays(today(),1);const flex=Math.min(14,Math.max(0,input.flexDays||0));return Array.from({length:flex*2+1},(_,i)=>addDays(base,i-flex)).filter(d=>d>=today())}
export async function searchTrips(input:SearchInput,fx:FxSnapshot){
  const origin=originPlace(input);if(!origin)return{results:[],source:'reference' as const,searchMode:input.dateMode||'anytime'};
  const candidates=uniqueDestinations.filter(d=>placeKey(d)!==placeKey(origin)&&(!input.destination||placeKey(d)===input.destination||d.iata===input.destination)&&(!input.region||input.region==='ALL'||d.region===input.region));
  const dates=dateCandidates(input);let all=candidates.flatMap(destination=>dates.map(departure=>costFor(input,destination,departure,fx)));let source:'live+reference'|'reference'='reference';const hasLive=Boolean(process.env.AMADEUS_CLIENT_ID&&process.env.AMADEUS_CLIENT_SECRET);const anytime=(input.dateMode||'anytime')==='anytime';
  if(hasLive&&input.destination&&origin.iata!==candidates[0]?.iata){let liveDates:string[]=[];if(anytime&&candidates[0]){const cheap=await getCheapestDates({origin:origin.iata,destination:candidates[0].iata,oneWay:input.tripType==='oneway',days:input.days});const horizonEnd=dates[dates.length-1];liveDates=cheap.map(x=>x.departure).filter(d=>d>=dates[0]&&d<=horizonEnd).slice(0,8)}if(!liveDates.length)liveDates=all.slice().sort((a,b)=>a.costs.total-b.costs.total).slice(0,6).map(x=>x.departure);const uniqueLiveDates=Array.from(new Set(liveDates));const confirmed=await Promise.all(uniqueLiveDates.map(async departure=>{const destination=candidates[0];if(!destination)return null;const returnDate=input.tripType==='round'?addDays(departure,Math.max(0,input.days-1)):null;const fare=await getLiveFare({origin:origin.iata,destination:destination.iata,departure,returnDate,adults:input.adults,children:input.children});return fare?costFor(input,destination,departure,fx,fare):null}));const liveResults=confirmed.filter((x):x is TripResult=>Boolean(x));if(liveResults.length){source='live+reference';const liveKeys=new Set(liveResults.map(x=>`${placeKey(x)}|${x.departure}`));all=all.filter(x=>!liveKeys.has(`${placeKey(x)}|${x.departure}`)).concat(liveResults)}}
  else if(hasLive&&anytime&&!input.destination){const referenceBest=all.slice().sort((a,b)=>a.costs.total-b.costs.total);const picked:TripResult[]=[];const seen=new Set<string>();for(const item of referenceBest){const key=placeKey(item);if(!seen.has(key)){seen.add(key);picked.push(item)}if(picked.length>=8)break}const confirmed=await Promise.all(picked.map(async item=>{if(origin.iata===item.iata)return item;const fare=await getLiveFare({origin:origin.iata,destination:item.iata,departure:item.departure,returnDate:item.returnDate,adults:input.adults,children:input.children});return fare?costFor(input,item,item.departure,fx,fare):item}));if(confirmed.some(x=>x.liveFare))source='live+reference';const keys=new Set(confirmed.map(x=>`${placeKey(x)}|${x.departure}`));all=all.filter(x=>!keys.has(`${placeKey(x)}|${x.departure}`)).concat(confirmed)}
  all.sort((a,b)=>a.costs.total-b.costs.total||a.departure.localeCompare(b.departure));const output:TripResult[]=[];const perDestination=new Map<string,number>();const perDayDestination=new Set<string>();for(const item of all){const destinationKey=placeKey(item);const dayKey=`${destinationKey}|${item.departure}`;if(perDayDestination.has(dayKey))continue;perDayDestination.add(dayKey);const count=perDestination.get(destinationKey)||0;const maxPerDestination=input.destination?30:3;if(count>=maxPerDestination)continue;perDestination.set(destinationKey,count+1);output.push(item);if(output.length>=60)break}output.sort((a,b)=>a.costs.total-b.costs.total||a.departure.localeCompare(b.departure));return{results:output,source,searchMode:anytime?'anytime':'specific',datesScanned:dates.length,methodologyVersion:'MIZAN-COST-2.0'};
}
