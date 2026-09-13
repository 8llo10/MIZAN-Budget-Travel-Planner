'use client';
import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';

export default function ThemeToggle(){
  const [theme,setTheme]=useState<'light'|'dark'>('light');
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const saved=localStorage.getItem('mizan-theme');
    const preferred=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
    const next=(saved==='dark'||saved==='light'?saved:preferred) as 'light'|'dark';
    setTheme(next);
    document.documentElement.dataset.theme=next;
    setReady(true);
  },[]);

  function toggle(){
    const next=theme==='light'?'dark':'light';
    setTheme(next);
    document.documentElement.dataset.theme=next;
    localStorage.setItem('mizan-theme',next);
  }

  return <button className="themeToggle" onClick={toggle} aria-label={theme==='light'?'Switch to dark mode':'Switch to light mode'} title={theme==='light'?'Dark mode':'Light mode'}>
    <span className="themeIcon">{ready&&theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</span>
    <span className="themeLabel">{ready&&theme==='dark'?'Light':'Dark'}</span>
  </button>
}
