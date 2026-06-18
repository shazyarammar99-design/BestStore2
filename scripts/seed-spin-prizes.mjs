/**
 * Seeds spin prizes into Supabase from src/config/spin-prizes.ts
 * Usage: npm run db:seed-prizes
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SPIN_PRIZES = [
  { name: '10% Store Credit', probability_weight: 50, value: 10 },
  { name: '500 IQD Bonus', probability_weight: 25, value: 500 },
  { name: 'Free Delivery Token', probability_weight: 15, value: 1 },
  { name: '1000 IQD Bonus', probability_weight: 5, value: 1000 },
  { name: 'Rare Skin Voucher', probability_weight: 3, value: 2500 },
  { name: 'Grand Prize — 5000 IQD', probability_weight: 2, value: 5000 },
];

function loadEnvLocal() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars already exported
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await admin.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await admin.from('spins').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await admin.from('prizes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { data, error } = await admin
    .from('prizes')
    .insert(
      SPIN_PRIZES.map((p) => ({
        name: p.name,
        probability_weight: p.probability_weight,
        image_url: null,
        value: p.value,
        active: true,
      }))
    )
    .select('name, probability_weight, value');

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  console.log('Spin prizes seeded successfully:');
  for (const row of data ?? []) {
    console.log(`  - ${row.name}: weight ${row.probability_weight}, value ${row.value}`);
  }
}

main();
