import MizanMark from '@/components/MizanMark';

export default function Loading(){
  return <div className="pageLoader" role="status" aria-label="Loading MIZAN">
    <div className="loaderOrbit"><span/><span/><span/><div className="loaderCore"><MizanMark className="loaderLogo"/></div></div>
    <strong>MIZAN</strong>
    <small>Finding the best way to spend your trip budget</small>
  </div>
}
