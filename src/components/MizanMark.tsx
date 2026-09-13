export default function MizanMark({className=''}:{className?:string}){
  return <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <defs><linearGradient id="mizan-gradient" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop stopColor="#8EDCFF"/><stop offset="1" stopColor="#2B8FC3"/></linearGradient></defs>
    <circle cx="32" cy="32" r="21" fill="none" stroke="url(#mizan-gradient)" strokeWidth="6"/>
    <path d="M19 39.5 29 22l6.2 11.2L45 24.5" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="19" cy="39.5" r="4" fill="#2B8FC3"/>
    <circle cx="45" cy="24.5" r="4" fill="#7BD5F7"/>
    <path d="M32 7.5 35.5 15 32 13.3 28.5 15 32 7.5Z" fill="currentColor"/>
  </svg>
}
