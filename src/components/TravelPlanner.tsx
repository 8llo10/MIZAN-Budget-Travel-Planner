'use client';
import {useMemo,useState} from 'react';
import {ArrowRight,CalendarDays,Check,ChevronDown,CircleDollarSign,Globe2,Languages,MapPin,Plane,RefreshCw,SlidersHorizontal,Sparkles,Users,WalletCards} from 'lucide-react';
import {gccCurrencies,placeKey,uniqueDestinations} from '@/lib/destinations';
import type {Region,SearchInput,TripResult} from '@/lib/types';

type Lang='en'|'ar';
type SortMode='cheapest'|'remaining'|'best';

const copy={
  en:{planner:'Planner',results:'Results',how:'How it works',budgetFirst:'BUDGET-FIRST TRAVEL',hero1:'Start with the budget.',hero2:'Then choose the trip.',heroP:'MIZAN compares the full cost of a trip — flights, stay, food, local transport and experiences — across Saudi Arabia, the GCC and Arab destinations.',saudi:'Saudi Arabia',gcc:'GCC',arab:'Arab world',multi:'Multi-currency',haveBudget:'I have a budget',knowDestination:'I know my destination',tripBuilder:'TRIP BUILDER',budgetQ:'How far can your budget take you?',destQ:'Find the cheapest total trip for this destination.',traveler:'traveler',travelers:'travelers',from:'FROM',country:'COUNTRY',city:'CITY',region:'SEARCH REGION',destination:'DESTINATION',currencyLabel:'DISPLAY CURRENCY',budget:'TOTAL BUDGET',departure:'DEPARTURE',dateMode:'WHEN DO YOU WANT TO TRAVEL?',anytime:'Anytime — find the cheapest dates',specific:'Specific date',window:'SEARCH WINDOW',oneMonth:'Next month',threeMonths:'Next 3 months',sixMonths:'Next 6 months',twelveMonths:'Next 12 months',length:'TRIP LENGTH',adults:'ADULTS',children:'CHILDREN',flex:'DATE FLEXIBILITY',style:'SPENDING STYLE',tripType:'TRIP TYPE',all:'All supported destinations',choose:'Choose a destination',days:'days',exact:'Exact date',smart:'Smart / value',balanced:'Balanced',comfort:'Comfort',round:'Round trip',oneway:'One way',include:'Include in trip total',stay:'Stay',food:'Food',local:'Local transport',experiences:'Experiences',chooseHint:'Choose a destination before searching.',searching:'Scanning dates and calculating the cheapest total trips…',find:'Find cheapest trips',compare:'Find cheapest dates',tripOptions:'TRIP OPTIONS',fit:(n:number)=>`${n} options fit your budget`,closest:'Cheapest options found',live:'Live flight fares + reference trip costs',reference:'Reference fare model',fx:'FX',liveRates:'live daily rates',refRates:'reference rates',bestMatch:'CHEAPEST FOUND',total:'TOTAL',budgetLabel:'BUDGET',left:'left',over:'over',used:'used',sort:'Sort',best:'Best match',cheapest:'Cheapest total',mostLeft:'Most budget left',direct:'Direct',stop:'stop',liveFare:'live fare',refFare:'reference fare',transport:'Transport',localCurrency:'Local currency',estimated:'Estimated trip total',perTraveler:'per traveler',room:'room',rooms:'rooms',scanned:'dates scanned',why:'WHY MIZAN',whyTitle:'A travel search that starts where real decisions start.',footer:'Budget-first trip planning for Saudi Arabia, the GCC and the Arab world.'},
  ar:{planner:'المخطط',results:'النتائج',how:'كيف يعمل',budgetFirst:'السفر يبدأ من ميزانيتك',hero1:'ابدأ بالميزانية.',hero2:'ثم اختر الرحلة.',heroP:'ميزان يقارن التكلفة الكاملة للرحلة — الطيران، السكن، الطعام، التنقل المحلي والتجارب — داخل السعودية والخليج والدول العربية.',saudi:'السعودية',gcc:'الخليج',arab:'الدول العربية',multi:'عملات متعددة',haveBudget:'عندي ميزانية',knowDestination:'أعرف وجهتي',tripBuilder:'مخطط الرحلة',budgetQ:'إلى أين يمكن أن توصلك ميزانيتك بأقل تكلفة؟',destQ:'اعثر على أرخص تكلفة كاملة لهذه الوجهة.',traveler:'مسافر',travelers:'مسافرين',from:'من',country:'الدولة',city:'المدينة',region:'نطاق البحث',destination:'الوجهة',currencyLabel:'عملة العرض',budget:'الميزانية الإجمالية',departure:'تاريخ المغادرة',dateMode:'متى تبغى تسافر؟',anytime:'أي وقت — جيب أرخص التواريخ',specific:'تاريخ محدد',window:'فترة البحث',oneMonth:'الشهر الجاي',threeMonths:'٣ أشهر قدام',sixMonths:'٦ أشهر قدام',twelveMonths:'١٢ شهر قدام',length:'مدة الرحلة',adults:'البالغون',children:'الأطفال',flex:'مرونة التاريخ',style:'نمط الصرف',tripType:'نوع الرحلة',all:'كل الوجهات المدعومة',choose:'اختر وجهة',days:'أيام',exact:'نفس التاريخ',smart:'اقتصادي',balanced:'متوازن',comfort:'مريح',round:'ذهاب وعودة',oneway:'ذهاب فقط',include:'أدخل ضمن إجمالي الرحلة',stay:'السكن',food:'الطعام',local:'التنقل المحلي',experiences:'الأنشطة والتجارب',chooseHint:'اختر الوجهة قبل البحث.',searching:'جاري فحص التواريخ وحساب أوفر الرحلات كاملة…',find:'جيب أوفر الرحلات',compare:'جيب أرخص التواريخ',tripOptions:'خيارات الرحلات',fit:(n:number)=>`${n} خيار ضمن ميزانيتك`,closest:'أرخص الخيارات الموجودة',live:'أسعار طيران مباشرة + تقديرات بقية الرحلة',reference:'نموذج أسعار مرجعي',fx:'العملة',liveRates:'أسعار يومية مباشرة',refRates:'أسعار مرجعية',bestMatch:'أوفر خيار',total:'الإجمالي',budgetLabel:'الميزانية',left:'متبقي',over:'زيادة',used:'مستخدم',sort:'الترتيب',best:'أفضل تطابق',cheapest:'الأرخص إجمالًا',mostLeft:'أكثر مبلغ متبقّي',direct:'مباشرة',stop:'توقف',liveFare:'سعر مباشر',refFare:'سعر مرجعي',transport:'التنقل',localCurrency:'العملة المحلية',estimated:'إجمالي الرحلة التقديري',perTraveler:'لكل مسافر',room:'غرفة',rooms:'غرف',scanned:'تاريخ تم فحصه',why:'لماذا ميزان؟',whyTitle:'بحث سفر يبدأ من النقطة التي تبدأ منها القرارات الحقيقية.',footer:'تخطيط رحلات حسب الميزانية للسعودية والخليج والدول العربية.'}
};

const fallbackSarPerUnit:Record<string,number>={SAR:1,AED:1.021,QAR:1.03,KWD:12.2,BHD:9.95,OMR:9.75};
const money=(sar:number,lang:Lang,currency:string,rates:Record<string,number>)=>{const rate=rates[currency]||fallbackSarPerUnit[currency]||1;return new Intl.NumberFormat(lang==='ar'?'ar-SA':'en-SA',{style:'currency',currency,maximumFractionDigits:['KWD','BHD','OMR'].includes(currency)?2:0}).format(sar/rate)};
const dateLabel=(v:string,lang:Lang)=>new Intl.DateTimeFormat(lang==='ar'?'ar-SA':'en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${v}T12:00:00Z`));
const inTwoWeeks=()=>{const d=new Date();d.setDate(d.getDate()+14);return d.toISOString().slice(0,10)};
const regionLabel=(r:string,lang:Lang)=>lang==='ar'?(r==='Saudi Arabia'?'السعودية':r==='GCC'?'الخليج':r==='Arab World'?'الدول العربية':r):r;
const arNames:Record<string,string>={'Saudi Arabia':'السعودية','United Arab Emirates':'الإمارات','Qatar':'قطر','Kuwait':'الكويت','Bahrain':'البحرين','Oman':'عُمان','Jeddah':'جدة','Riyadh':'الرياض','Dammam':'الدمام','Madinah':'المدينة المنورة','Makkah':'مكة المكرمة','Abha':'أبها','Taif':'الطائف','AlUla':'العلا','Tabuk':'تبوك','Jazan':'جازان','Yanbu':'ينبع','Al Baha':'الباحة','Hail':'حائل','Qassim':'القصيم','Najran':'نجران','Al Ahsa':'الأحساء','Sakaka':'سكاكا','Arar':'عرعر','Khobar':'الخبر','Jubail':'الجبيل','Dubai':'دبي','Abu Dhabi':'أبوظبي','Sharjah':'الشارقة','Ras Al Khaimah':'رأس الخيمة','Al Ain':'العين','Fujairah':'الفجيرة','Doha':'الدوحة','Kuwait City':'مدينة الكويت','Manama':'المنامة','Muharraq':'المحرق','Muscat':'مسقط','Salalah':'صلالة','Sohar':'صحار','Duqm':'الدقم'};
const placeLabel=(v:string,lang:Lang)=>lang==='ar'?(arNames[v]||v):v;

export default function TravelPlanner(){
  const [lang,setLang]=useState<Lang>('en'); const t=copy[lang];
  const [mode,setMode]=useState<'budget'|'destination'>('budget');
  const [sortMode,setSortMode]=useState<SortMode>('cheapest');
  const [originCountry,setOriginCountry]=useState('Saudi Arabia');
  const [destinationCountry,setDestinationCountry]=useState('Saudi Arabia');
  const [form,setForm]=useState<SearchInput>({origin:'Saudi Arabia|Jeddah',destination:'',region:'ALL',currency:'SAR',budget:3500,adults:1,children:0,days:5,dateMode:'anytime',searchMonths:12,startDate:inTwoWeeks(),flexDays:3,includeHotel:true,includeFood:true,includeLocal:true,includeActivities:true,tripType:'round',spendStyle:'balanced'});
  const [results,setResults]=useState<TripResult[]>([]);
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [error,setError]=useState('');
  const [meta,setMeta]=useState<{source?:string;fxSource?:string;sarPerUnit:Record<string,number>;datesScanned?:number}>({sarPerUnit:fallbackSarPerUnit});

  const set=<K extends keyof SearchInput>(k:K,v:SearchInput[K])=>setForm(x=>({...x,[k]:v}));
  const party=form.adults+form.children;
  const selectedCurrency=form.currency||'SAR';
  const supportedCountries=useMemo(()=>Array.from(new Set(uniqueDestinations.map(d=>d.country))),[]);
  const originCities=uniqueDestinations.filter(d=>d.country===originCountry);
  const visibleDestinations=uniqueDestinations.filter(d=>form.region==='ALL'||d.region===form.region);
  const destinationCountries=Array.from(new Set(visibleDestinations.map(d=>d.country)));
  const destinationCities=visibleDestinations.filter(d=>d.country===destinationCountry);
  const within=useMemo(()=>results.filter(r=>r.within),[results]);
  const sortedResults=useMemo(()=>[...results].sort((a,b)=>sortMode==='remaining'?b.remaining-a.remaining:sortMode==='best'?b.score-a.score:a.costs.total-b.costs.total),[results,sortMode]);
  const best=sortedResults[0];
  const moneyNow=(v:number)=>money(v,lang,selectedCurrency,meta.sarPerUnit);

  const chooseOriginCountry=(country:string)=>{setOriginCountry(country);const first=uniqueDestinations.find(d=>d.country===country);if(first)set('origin',placeKey(first))};
  const chooseDestinationCountry=(country:string)=>{setDestinationCountry(country);const first=visibleDestinations.find(d=>d.country===country);set('destination',first?placeKey(first):'')};

  async function search(){
    setLoading(true);setError('');setSearched(false);
    try{
      const res=await fetch('/api/search',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...form,destination:mode==='destination'?form.destination:''})});
      const json=await res.json();
      if(!res.ok)throw new Error(json.error||'Search failed');
      setResults(json.results||[]);
      setMeta({source:json.source,fxSource:json.fx?.source,sarPerUnit:json.fx?.sarPerUnit||fallbackSarPerUnit,datesScanned:json.datesScanned});
      setSortMode('cheapest');
      setSearched(true);
    }catch(e){setError(e instanceof Error?e.message:'Search failed')}finally{setLoading(false)}
  }

  return <main dir={lang==='ar'?'rtl':'ltr'} lang={lang} className={lang==='ar'?'rtl':''}>
    <header className="topbar"><a className="brand" href="#top"><span className="mark">M</span><span>MIZAN</span></a><nav><a href="#planner">{t.planner}</a><a href="#results">{t.results}</a><a href="#how">{t.how}</a></nav><div className="headerActions"><button className="language" onClick={()=>setLang(x=>x==='en'?'ar':'en')}><Languages size={16}/>{lang==='en'?'العربية':'English'}</button><label className="currency"><select aria-label={t.currencyLabel} value={selectedCurrency} onChange={e=>set('currency',e.target.value)}>{gccCurrencies.map(c=><option key={c} value={c}>{c}</option>)}</select><ChevronDown size={14}/></label></div></header>

    <section id="top" className="hero shell"><div className="eyebrow"><Sparkles size={15}/> {t.budgetFirst}</div><h1>{t.hero1}<br/><em>{t.hero2}</em></h1><p>{t.heroP}</p><div className="scope"><span><Check/> {t.saudi}</span><span><Check/> {t.gcc}</span><span><Check/> {t.arab}</span><span><Globe2/> {t.multi}</span></div></section>

    <section id="planner" className="planner shell">
      <div className="modeTabs"><button className={mode==='budget'?'active':''} onClick={()=>setMode('budget')}>{t.haveBudget}</button><button className={mode==='destination'?'active':''} onClick={()=>setMode('destination')}>{t.knowDestination}</button></div>
      <div className="plannerIntro"><div><small>{t.tripBuilder}</small><h2>{mode==='budget'?t.budgetQ:t.destQ}</h2></div><div className="partyPill"><Users size={16}/>{party} {party===1?t.traveler:t.travelers}</div></div>

      <div className="formGrid">
        <Field label={`${t.from} · ${t.country}`} icon={<Globe2/>}><select value={originCountry} onChange={e=>chooseOriginCountry(e.target.value)}>{supportedCountries.map(c=><option key={c} value={c}>{placeLabel(c,lang)}</option>)}</select></Field>
        <Field label={`${t.from} · ${t.city}`} icon={<MapPin/>}><select value={form.origin} onChange={e=>set('origin',e.target.value)}>{originCities.map(d=><option key={placeKey(d)} value={placeKey(d)}>{placeLabel(d.city,lang)} ({d.iata})</option>)}</select></Field>
        {mode==='budget'?<Field label={t.region} icon={<Globe2/>}><select value={form.region} onChange={e=>set('region',e.target.value as 'ALL'|Region)}><option value="ALL">{t.all}</option><option value="Saudi Arabia">{regionLabel('Saudi Arabia',lang)}</option><option value="GCC">{regionLabel('GCC',lang)}</option><option value="Arab World">{regionLabel('Arab World',lang)}</option></select></Field>:<Field label={`${t.destination} · ${t.country}`} icon={<Globe2/>}><select value={destinationCountry} onChange={e=>chooseDestinationCountry(e.target.value)}>{destinationCountries.map(c=><option key={c} value={c}>{placeLabel(c,lang)}</option>)}</select></Field>}
        {mode==='destination'&&<Field label={`${t.destination} · ${t.city}`} icon={<Plane/>}><select value={form.destination} onChange={e=>set('destination',e.target.value)}><option value="">{t.choose}</option>{destinationCities.map(d=><option key={placeKey(d)} value={placeKey(d)}>{placeLabel(d.city,lang)} ({d.iata})</option>)}</select></Field>}
        <Field label={t.currencyLabel} icon={<CircleDollarSign/>}><select value={selectedCurrency} onChange={e=>set('currency',e.target.value)}>{gccCurrencies.map(c=><option key={c}>{c}</option>)}</select></Field>
        <Field label={t.budget} icon={<WalletCards/>}><input type="number" min="1" step="50" value={form.budget} onChange={e=>set('budget',Number(e.target.value))}/><b>{selectedCurrency}</b></Field>
        <Field label={t.dateMode} icon={<CalendarDays/>}><select value={form.dateMode||'anytime'} onChange={e=>set('dateMode',e.target.value as 'anytime'|'specific')}><option value="anytime">{t.anytime}</option><option value="specific">{t.specific}</option></select></Field>
        {(form.dateMode||'anytime')==='anytime'?<Field label={t.window} icon={<RefreshCw/>}><select value={form.searchMonths||12} onChange={e=>set('searchMonths',Number(e.target.value) as 1|3|6|12)}><option value="1">{t.oneMonth}</option><option value="3">{t.threeMonths}</option><option value="6">{t.sixMonths}</option><option value="12">{t.twelveMonths}</option></select></Field>:<><Field label={t.departure} icon={<CalendarDays/>}><input type="date" value={form.startDate||''} min={new Date().toISOString().slice(0,10)} onChange={e=>set('startDate',e.target.value)}/></Field><Field label={t.flex} icon={<RefreshCw/>}><select value={form.flexDays} onChange={e=>set('flexDays',Number(e.target.value))}><option value="0">{t.exact}</option><option value="1">± 1</option><option value="3">± 3</option><option value="7">± 7</option><option value="14">± 14</option></select></Field></>}
        <Field label={t.length} icon={<CalendarDays/>}><input type="number" min="1" max="60" value={form.days} onChange={e=>set('days',Number(e.target.value))}/><b>{t.days}</b></Field>
        <Field label={t.tripType} icon={<Plane/>}><select value={form.tripType} onChange={e=>set('tripType',e.target.value as SearchInput['tripType'])}><option value="round">{t.round}</option><option value="oneway">{t.oneway}</option></select></Field>
        <Field label={t.adults} icon={<Users/>}><input type="number" min="1" max="20" value={form.adults} onChange={e=>set('adults',Number(e.target.value))}/></Field>
        <Field label={t.children} icon={<Users/>}><input type="number" min="0" max="20" value={form.children} onChange={e=>set('children',Number(e.target.value))}/></Field>
        <Field label={t.style} icon={<CircleDollarSign/>}><select value={form.spendStyle} onChange={e=>set('spendStyle',e.target.value as SearchInput['spendStyle'])}><option value="smart">{t.smart}</option><option value="balanced">{t.balanced}</option><option value="comfort">{t.comfort}</option></select></Field>
      </div>

      <div className="optionsBar"><div className="optionsTitle"><SlidersHorizontal size={17}/><strong>{t.include}</strong></div>{([['includeHotel',t.stay],['includeFood',t.food],['includeLocal',t.local],['includeActivities',t.experiences]] as const).map(([k,l])=><label className="toggleChip" key={k}><input type="checkbox" checked={form[k]} onChange={e=>set(k,e.target.checked)}/><span>{l}</span></label>)}</div>
      {mode==='destination'&&!form.destination&&<p className="hint">{t.chooseHint}</p>}
      {error&&<p className="error">{error}</p>}
      <button className="searchButton" onClick={search} disabled={loading||(mode==='destination'&&!form.destination)}>{loading?t.searching:mode==='budget'?t.find:t.compare} <ArrowRight size={18}/></button>
    </section>

    {searched&&<section id="results" className="results shell">
      <div className="resultsHead"><div><small>{t.tripOptions}</small><h2>{within.length?t.fit(within.length):t.closest}</h2>{meta.datesScanned&&<p className="hint">{meta.datesScanned} {t.scanned}</p>}</div><div className="resultControls"><div className="sourceNotes"><span>{meta.source==='live+reference'?t.live:t.reference}</span><span>{t.fx}: {meta.fxSource==='live'?t.liveRates:t.refRates}</span></div><label className="sortSelect">{t.sort}<select value={sortMode} onChange={e=>setSortMode(e.target.value as SortMode)}><option value="cheapest">{t.cheapest}</option><option value="remaining">{t.mostLeft}</option><option value="best">{t.best}</option></select></label></div></div>
      {best&&<div className="bestSummary"><div><small>{t.bestMatch}</small><strong>{placeLabel(best.city,lang)}</strong><span>{placeLabel(best.country,lang)} · {dateLabel(best.departure,lang)}</span></div><div><small>{t.total}</small><strong>{moneyNow(best.costs.total)}</strong><span>{moneyNow(best.costs.perPerson)} {t.perTraveler}</span></div><div><small>{t.budgetLabel}</small><strong>{best.within?`${moneyNow(best.remaining)} ${t.left}`:`${moneyNow(-best.remaining)} ${t.over}`}</strong><span>{best.budgetUsage}% {t.used}</span></div></div>}
      <div className="cards">{sortedResults.map((r,i)=><TripCard key={`${placeKey(r)}-${r.departure}-${i}`} result={r} rank={i+1} lang={lang} t={t} moneyNow={moneyNow}/>)}</div>
    </section>}

    <section id="how" className="how"><div className="shell"><small>{t.why}</small><h2>{t.whyTitle}</h2></div></section>
    <footer><div className="shell footerInner"><div className="brand"><span className="mark">M</span><span>MIZAN</span></div><p>{t.footer}</p></div></footer>
  </main>
}

function Field({label,icon,children}:{label:string;icon:React.ReactNode;children:React.ReactNode}){return <label className="field"><small>{label}</small><div>{icon}{children}</div></label>}

function TripCard({result:r,rank,lang,t,moneyNow}:{result:TripResult;rank:number;lang:Lang;t:any;moneyNow:(n:number)=>string}){
  return <article className="tripCard"><div className="cardTop"><div><span className="rank">#{String(rank).padStart(2,'0')}</span><h3>{placeLabel(r.city,lang)}</h3><p>{placeLabel(r.country,lang)} · {dateLabel(r.departure,lang)}{r.returnDate?` → ${dateLabel(r.returnDate,lang)}`:''}</p></div><span className={r.within?'fit':'over'}>{r.within?`${moneyNow(r.remaining)} ${t.left}`:`${moneyNow(-r.remaining)} ${t.over}`}</span></div><div className="flightLine"><Plane size={18}/><div><b>{r.carrier}</b><small>{r.stops?`${r.stops} ${t.stop}`:t.direct} · {r.liveFare?t.liveFare:t.refFare}</small></div><strong>{moneyNow(r.costs.flight)}</strong></div><div className="breakdown"><span>{t.stay} <b>{moneyNow(r.costs.hotel)}</b></span><span>{t.food} <b>{moneyNow(r.costs.food)}</b></span><span>{t.transport} <b>{moneyNow(r.costs.local)}</b></span><span>{t.experiences} <b>{moneyNow(r.costs.activities)}</b></span></div><div className="currencyLine">{t.localCurrency}: <b>{r.nativeCurrency}</b> · 1 {r.nativeCurrency} ≈ {r.fxRateToSar.toFixed(r.fxRateToSar<0.1?3:2)} SAR</div><div className="total"><div><span>{t.estimated}</span><small>{moneyNow(r.costs.perPerson)} {t.perTraveler} · {r.rooms} {r.rooms===1?t.room:t.rooms}</small></div><strong>{moneyNow(r.costs.total)}</strong></div><div className="budgetTrack"><i style={{width:`${Math.min(100,r.budgetUsage)}%`}} className={r.within?'ok':'danger'}/></div></article>
}
