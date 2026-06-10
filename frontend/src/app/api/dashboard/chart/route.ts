import { NextResponse } from 'next/server';
import { db, kasKarangtaruna } from '@kas/backend';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || '8 Minggu';

    const allKas = await db.select().from(kasKarangtaruna);
    const now = new Date();
    
    // Grouping helper
    const result: any[] = [];
    
    if (filter === '1 Minggu') {
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const currentDay = now.getDay();
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayName = days[d.getDay()];
        const startOfDay = d.getTime();
        const endOfDay = startOfDay + 86400000;
        
        let amount = 0;
        allKas.forEach(k => {
          if (k.jenis === 'Masuk') {
            const time = new Date(k.tanggal || 0).getTime();
            if (time >= startOfDay && time < endOfDay) amount += k.nominal;
          }
        });
        
        result.push({ name: dayName, amount });
      }
    } else if (filter === '6 Bulan') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = months[d.getMonth()];
        const startOfMonth = d.getTime();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1).getTime();
        
        let amount = 0;
        allKas.forEach(k => {
          if (k.jenis === 'Masuk') {
            const time = new Date(k.tanggal || 0).getTime();
            if (time >= startOfMonth && time < endOfMonth) amount += k.nominal;
          }
        });
        
        result.push({ name: monthName, amount });
      }
    } else {
      // For 4 Minggu or 8 Minggu
      const weeksCount = filter === '4 Minggu' ? 4 : 8;
      for (let i = weeksCount - 1; i >= 0; i--) {
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay()||7) + 1 - (i * 7)).getTime();
        const endOfWeek = startOfWeek + (7 * 86400000);
        
        let amount = 0;
        allKas.forEach(k => {
          if (k.jenis === 'Masuk') {
            const time = new Date(k.tanggal || 0).getTime();
            if (time >= startOfWeek && time < endOfWeek) amount += k.nominal;
          }
        });
        
        result.push({ name: `Mg ${weeksCount - i}`, amount });
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}
