const fallbackSarPerUnit: Record<string, number> = {
  SAR: 1, AED: 1.021, QAR: 1.03, KWD: 12.21, BHD: 9.95, OMR: 9.74,
  USD: 3.75, EGP: 0.076, JOD: 5.29, MAD: 0.42, TND: 1.22,
  DZD: 0.028, IQD: 0.00286, ILS: 1.02, LYD: 0.78, DJF: 0.0211, MRU: 0.094, KMF: 0.0082
};

export type FxSnapshot = {
  sarPerUnit: Record<string, number>;
  source: 'live' | 'reference';
  updatedAt: string;
};

export async function getFxSnapshot(): Promise<FxSnapshot> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/SAR', {
      next: { revalidate: 60 * 60 * 12 },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) throw new Error('FX provider unavailable');
    const data = await res.json() as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
    if (data.result !== 'success' || !data.rates) throw new Error('Invalid FX payload');
    const sarPerUnit: Record<string, number> = {...fallbackSarPerUnit};
    for (const [currency, unitsPerSar] of Object.entries(data.rates)) {
      if (unitsPerSar > 0) sarPerUnit[currency] = 1 / unitsPerSar;
    }
    return { sarPerUnit, source: 'live', updatedAt: data.time_last_update_utc || new Date().toISOString() };
  } catch {
    return { sarPerUnit: fallbackSarPerUnit, source: 'reference', updatedAt: new Date().toISOString() };
  }
}
