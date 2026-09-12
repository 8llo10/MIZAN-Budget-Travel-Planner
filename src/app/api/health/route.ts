import { NextResponse } from 'next/server';
export function GET(){return NextResponse.json({ok:true,service:'mizan',version:'2.0.0',time:new Date().toISOString()});}
