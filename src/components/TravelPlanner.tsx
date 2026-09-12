'use client';
import {useMemo,useState} from 'react';
import {ArrowRight,CalendarDays,Check,ChevronDown,CircleDollarSign,Globe2,MapPin,Plane,RefreshCw,SlidersHorizontal,Sparkles,Users,WalletCards} from 'lucide-react';
import {uniqueDestinations} from '@/lib/destinations';
import type {Region,SearchInput,TripResult} from '@/lib/types';

const money=(n:number)=>new Intl.NumberFormat('en-SA',{style:'currency',currency:'SAR',maximumFractionDigits:0}).format(n);
const dateLabel=(v:string)=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short'}).format(new Date(`${v}T12:00:00Z`));
const inTwoWeeks=()=>{const d=new Date();d.setDate(d.getDate()+14);return d.toISOString().slice(0,10)};

export default function TravelPlanner(){
  const [mode,setMode]=useState<'budget'|'destination'>('budget');
  const [form,setForm]=useState<SearchInput>({origin:'JED',destination:'',region:'ALL',budget:3500,adults:1,children:0,days:5,startDate:inTwoWeeks(),flexDays:3,includeHotel:true,includeFood:true,includeLocal:true,includeActivities:true,tripType:'round',spendStyle:'balanced'});
  const [results,setResults]=useState<TripResult[]>([]);
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [error,setError]=useState('');
  const [meta,setMeta]=useState<{source?:string;fxSource?:string}>({});
  const set=<K extends keyof SearchInput>(k:K,v:SearchInput[K])=>setForm(x=>({...x,[k]:v}));
  const party=form.adults+form.children;
  const within=useMemo(()=>results.filter(r=>r.within),[results]);
  const best=within[0]||results[0];
  const origins=uniqueDestinations.filter(d=>d.region==='Saudi Arabia');
  const visibleDestinations=uniqueDestinations.filter(d=>form.region==='ALL'||d.region===form.region);

  async function search(){
    setLoading(true);setError('');setSearched(false);
    try{
      const res=await fetch('/api/search',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...form,destination:mode==='destination'?form.destination:''})});
      const json=await res.json();
      if(!res.ok) throw new Error(json.error||'Search failed');
      setResults(json.results||[]);setMeta({source:json.source,fxSource:json.fx?.source});setSearched(true);
    }catch(e){setError(e instanceof Error?e.message:'Search failed');}
    finally{setLoading(false)}
  }

  return <main>
    <header className="topbar"><a className="brand" href="#top"><span className="mark">M</span><span>MIZAN</span></a><nav><a href="#planner">Planner</a><a href="#results">Results</a><a href="#how">How it works</a></nav><div className="currency">SAR <ChevronDown size={14}/></div></header>

    <section id="top" className="hero shell">
      <div className="eyebrow"><Sparkles size={15}/> BUDGET-FIRST TRAVEL</div>
      <h1>Start with the budget.<br/><em>Then choose the trip.</em></h1>
      <p>MIZAN compares the full cost of a trip — flights, stay, food, local transport and experiences — across Saudi Arabia, the GCC and Arab destinations.</p>
      <div className="scope"><span><Check/> Saudi Arabia</span><span><Check/> GCC</span><span><Check/> Arab world</span><span><Globe2/> Multi-currency</span></div>
    </section>

    <section id="planner" className="planner shell">
      <div className="modeTabs"><button className={mode==='budget'?'active':''} onClick={()=>setMode('budget')}>I have a budget</button><button className={mode==='destination'?'active':''} onClick={()=>setMode('destination')}>I know my destination</button></div>
      <div className="plannerIntro"><div><small>TRIP BUILDER</small><h2>{mode==='budget'?'How far can your budget take you?':'Find the best total for this destination.'}</h2></div><div className="partyPill"><Users size={16}/>{party} traveler{party===1?'':'s'}</div></div>

      <div className="formGrid">
        <Field label="FROM" icon={<MapPin/>}><select value={form.origin} onChange={e=>set('origin',e.target.value)}>{origins.map(d=><option key={d.iata} value={d.iata}>{d.city} ({d.iata})</option>)}</select></Field>
        {mode==='budget'?<Field label="SEARCH REGION" icon={<Globe2/>}><select value={form.region} onChange={e=>set('region',e.target.value as 'ALL'|Region)}><option value="ALL">All supported destinations</option><option>Saudi Arabia</option><option>GCC</option><option>Arab World</option></select></Field>:
        <Field label="DESTINATION" icon={<Plane/>}><select value={form.destination} onChange={e=>set('destination',e.target.value)}><option value="">Choose a destination</option>{visibleDestinations.map(d=><option key={d.iata} value={d.iata}>{d.city}, {d.country}</option>)}</select></Field>}
        <Field label="TOTAL BUDGET" icon={<WalletCards/>}><input type="number" min="100" step="100" value={form.budget} onChange={e=>set('budget',Number(e.target.value))}/><b>SAR</b></Field>
        <Field label="DEPARTURE" icon={<CalendarDays/>}><input type="date" value={form.startDate} min={new Date().toISOString().slice(0,10)} onChange={e=>set('startDate',e.target.value)}/></Field>
        <Field label="TRIP LENGTH" icon={<CalendarDays/>}><input type="number" min="1" max="60" value={form.days} onChange={e=>set('days',Number(e.target.value))}/><b>days</b></Field>
        <Field label="ADULTS" icon={<Users/>}><input type="number" min="1" max="20" value={form.adults} onChange={e=>set('adults',Number(e.target.value))}/></Field>
        <Field label="CHILDREN" icon={<Users/>}><input type="number" min="0" max="20" value={form.children} onChange={e=>set('children',Number(e.target.value))}/></Field>
        <Field label="DATE FLEXIBILITY" icon={<RefreshCw/>}><select value={form.flexDays} onChange={e=>set('flexDays',Number(e.target.value))}><option value="0">Exact dates</option><option value="1">± 1 day</option><option value="3">± 3 days</option><option value="7">± 7 days</option></select></Field>
        <Field label="SPENDING STYLE" icon={<CircleDollarSign/>}><select value={form.spendStyle} onChange={e=>set('spendStyle',e.target.value as SearchInput['spendStyle'])}><option value="smart">Smart / value</option><option value="balanced">Balanced</option><option value="comfort">Comfort</option></select></Field>
      </div>

      <div className="optionsBar"><div className="optionsTitle"><SlidersHorizontal size={17}/><strong>Include in trip total</strong></div>{([['includeHotel','Stay'],['includeFood','Food'],['includeLocal','Local transport'],['includeActivities','Experiences']] as const).map(([k,l])=><label className="toggleChip" key={k}><input type="checkbox" checked={form[k]} onChange={e=>set(k,e.target.checked)}/><span>{l}</span></label>)}</div>
      {mode==='destination'&&!form.destination&&<p className="hint">Choose a destination before searching.</p>}
      {error&&<p className="error">{error}</p>}
      <button className="searchButton" onClick={search} disabled={loading||(mode==='destination'&&!form.destination)}>{loading?'Calculating the full trip…':mode==='budget'?'Find trips within my budget':'Compare this destination'} <ArrowRight size={18}/></button>
    </section>

    {searched&&<section id="results" className="results shell">
      <div className="resultsHead"><div><small>TRIP OPTIONS</small><h2>{within.length?`${within.length} options fit your budget`:'Closest options to your budget'}</h2></div><div className="sourceNotes"><span>{meta.source==='live+reference'?'Live flight fares + reference trip costs':'Reference fare model'}</span><span>FX: {meta.fxSource==='live'?'live daily rates':'reference rates'}</span></div></div>
      {best&&<div className="bestSummary"><div><small>BEST MATCH</small><strong>{best.city}</strong><span>{best.country}</span></div><div><small>TOTAL</small><strong>{money(best.costs.total)}</strong><span>{money(best.costs.perPerson)} / traveler</span></div><div><small>BUDGET</small><strong>{best.within?`${money(best.remaining)} left`:`${money(-best.remaining)} over`}</strong><span>{best.budgetUsage}% used</span></div></div>}
      <div className="cards">{results.map((r,i)=><TripCard key={`${r.iata}-${r.departure}-${i}`} result={r} rank={i+1}/>)}</div>
      <p className="disclaimer">Flight fares use live Amadeus data when API credentials are connected; otherwise MIZAN uses a deterministic reference-price model for planning. Accommodation and daily-cost estimates are planning estimates, not booking quotes.</p>
    </section>}

    <section id="how" className="how"><div className="shell"><small>WHY MIZAN</small><h2>A travel search that starts where real decisions start.</h2><div className="howGrid"><article><b>01</b><h3>Budget first</h3><p>Search from the amount you can actually spend instead of discovering the total after choosing a destination.</p></article><article><b>02</b><h3>Whole-trip math</h3><p>Flights, rooms, food, transport and experiences are normalized into SAR for one comparable total.</p></article><article><b>03</b><h3>Flexible-date engine</h3><p>Nearby departure dates are evaluated because moving a trip by one or three days can change the final cost.</p></article><article><b>04</b><h3>Family-aware</h3><p>Adult and child counts affect flights, room count and daily spending instead of multiplying one generic price.</p></article></div></div></section>
    <footer><div className="shell footerInner"><div className="brand"><span className="mark">M</span><span>MIZAN</span></div><p>Budget-first trip planning for Saudi Arabia, the GCC and the Arab world.</p></div></footer>
  </main>
}

function Field({label,icon,children}:{label:string;icon:React.ReactNode;children:React.ReactNode}){return <label className="field"><small>{label}</small><div>{icon}{children}</div></label>}
function TripCard({result:r,rank}:{result:TripResult;rank:number}){return <article className="tripCard"><div className="cardTop"><div><span className="rank">#{String(rank).padStart(2,'0')}</span><h3>{r.city}</h3><p>{r.country} · {dateLabel(r.departure)}{r.returnDate?` → ${dateLabel(r.returnDate)}`:''}</p></div><span className={r.within?'fit':'over'}>{r.within?`${money(r.remaining)} left`:`${money(-r.remaining)} over`}</span></div><div className="flightLine"><Plane size={18}/><div><b>{r.carrier}</b><small>{r.stops?`${r.stops} stop`:'Direct'} · {r.liveFare?'live fare':'reference fare'}</small></div><strong>{money(r.costs.flight)}</strong></div><div className="breakdown"><span>Stay <b>{money(r.costs.hotel)}</b></span><span>Food <b>{money(r.costs.food)}</b></span><span>Transport <b>{money(r.costs.local)}</b></span><span>Experiences <b>{money(r.costs.activities)}</b></span></div><div className="currencyLine">Local currency: <b>{r.nativeCurrency}</b> · 1 {r.nativeCurrency} ≈ {r.fxRateToSar.toFixed(r.fxRateToSar<0.1?3:2)} SAR</div><div className="total"><div><span>Estimated trip total</span><small>{money(r.costs.perPerson)} per traveler · {r.rooms} room{r.rooms===1?'':'s'}</small></div><strong>{money(r.costs.total)}</strong></div><div className="budgetTrack"><i style={{width:`${Math.min(100,r.budgetUsage)}%`}} className={r.within?'ok':'danger'}/></div></article>}
