import type { SupabaseClient } from '@supabase/supabase-js';

import { MIN_PURCHASE_IQD_FOR_SPIN, MONTHLY_FREE_SPIN_MS } from '@/config/spin';



type AdminClient = SupabaseClient;



function defaultUsername(email: string | undefined): string {

  const fromEmail = email?.split('@')[0]?.trim();

  return fromEmail && fromEmail.length >= 2 ? fromEmail : 'player';

}



function defaultNextFreeSpinAt(): string {

  return new Date(Date.now() + MONTHLY_FREE_SPIN_MS).toISOString();

}



export async function getSpinCredits(

  admin: AdminClient,

  userId: string

): Promise<number> {

  const { data } = await admin

    .from('profiles')

    .select('spin_credits')

    .eq('id', userId)

    .maybeSingle();



  return data?.spin_credits ?? 0;

}



export async function syncMonthlyFreeSpins(

  admin: AdminClient,

  userId: string

): Promise<

  | { grantedCount: number; spinCredits: number; nextFreeSpinAt: string | null }

  | { error: string }

> {

  const { data: profile, error: fetchError } = await admin

    .from('profiles')

    .select('spin_credits, next_free_spin_at, monthly_spin_pending')

    .eq('id', userId)

    .maybeSingle();



  if (fetchError) return { error: 'Failed to load profile.' };

  if (!profile) {

    return { grantedCount: 0, spinCredits: 0, nextFreeSpinAt: null };

  }



  let spinCredits = profile.spin_credits ?? 0;

  let nextFreeSpinAtMs = profile.next_free_spin_at

    ? new Date(profile.next_free_spin_at).getTime()

    : Date.now() + MONTHLY_FREE_SPIN_MS;



  if (!profile.next_free_spin_at) {

    nextFreeSpinAtMs = Date.now() + MONTHLY_FREE_SPIN_MS;

  }



  let monthlySpinPending = profile.monthly_spin_pending ?? false;

  let grantedCount = 0;

  const now = Date.now();



  if (now >= nextFreeSpinAtMs && !monthlySpinPending) {

    spinCredits += 1;

    grantedCount = 1;

    monthlySpinPending = true;

  }



  if (grantedCount > 0 || !profile.next_free_spin_at) {

    const { error: updateError } = await admin

      .from('profiles')

      .update({

        spin_credits: spinCredits,

        monthly_spin_pending: monthlySpinPending,

        ...(!profile.next_free_spin_at

          ? { next_free_spin_at: new Date(nextFreeSpinAtMs).toISOString() }

          : {}),

      })

      .eq('id', userId);



    if (updateError) return { error: 'Failed to sync monthly spin credits.' };

  }



  return {

    grantedCount,

    spinCredits,

    nextFreeSpinAt: new Date(nextFreeSpinAtMs).toISOString(),

  };

}



export async function grantSpinCreditForPurchase(

  admin: AdminClient,

  userId: string,

  email: string | undefined,

  purchaseId: string,

  amount: number

): Promise<

  | { spinCreditGranted: boolean; spinCreditsTotal: number }

  | { error: string }

> {

  const spinCreditsTotal = await getSpinCredits(admin, userId);



  if (amount < MIN_PURCHASE_IQD_FOR_SPIN) {

    return { spinCreditGranted: false, spinCreditsTotal };

  }



  const { data: purchase } = await admin

    .from('purchases')

    .select('spin_credit_granted')

    .eq('id', purchaseId)

    .maybeSingle();



  if (purchase?.spin_credit_granted) {

    return { spinCreditGranted: false, spinCreditsTotal };

  }



  const { data: profile } = await admin

    .from('profiles')

    .select('spin_credits')

    .eq('id', userId)

    .maybeSingle();



  let newTotal: number;



  if (profile) {

    newTotal = profile.spin_credits + 1;

    const { error: updateError } = await admin

      .from('profiles')

      .update({ spin_credits: newTotal })

      .eq('id', userId);



    if (updateError) return { error: 'Failed to grant spin credit.' };

  } else {

    newTotal = 1;

    const { error: insertError } = await admin.from('profiles').insert({

      id: userId,

      username: defaultUsername(email),

      avatar_url: null,

      spin_credits: 1,

      next_free_spin_at: defaultNextFreeSpinAt(),

      monthly_spin_pending: false,

    });



    if (insertError) return { error: 'Failed to grant spin credit.' };

  }



  const { error: flagError } = await admin

    .from('purchases')

    .update({ spin_credit_granted: true })

    .eq('id', purchaseId);



  if (flagError) return { error: 'Failed to record spin credit.' };



  return { spinCreditGranted: true, spinCreditsTotal: newTotal };

}



export async function consumeSpinCredit(

  admin: AdminClient,

  userId: string

): Promise<

  | { ok: true; remaining: number; monthlySpinPending: boolean }

  | { error: string }

> {

  const { data: profile, error: fetchError } = await admin

    .from('profiles')

    .select('spin_credits, monthly_spin_pending')

    .eq('id', userId)

    .maybeSingle();



  if (fetchError || !profile) {

    return { error: 'No spin credits available.' };

  }



  const credits = profile.spin_credits ?? 0;

  if (credits <= 0) {

    return { error: 'No spin credits available.' };

  }



  const remaining = credits - 1;

  const { error } = await admin

    .from('profiles')

    .update({ spin_credits: remaining })

    .eq('id', userId)

    .eq('spin_credits', credits);



  if (error) {

    return { error: 'Failed to consume spin credit.' };

  }



  return {

    ok: true,

    remaining,

    monthlySpinPending: profile.monthly_spin_pending ?? false,

  };

}



export async function resetMonthlySpinTimerOnSpin(

  admin: AdminClient,

  userId: string,

  hadMonthlyPending: boolean

): Promise<{ error: string } | { ok: true }> {

  const { error } = await admin

    .from('profiles')

    .update({

      next_free_spin_at: defaultNextFreeSpinAt(),

      ...(hadMonthlyPending ? { monthly_spin_pending: false } : {}),

    })

    .eq('id', userId);



  if (error) {

    return { error: 'Failed to reset monthly spin timer.' };

  }



  return { ok: true };

}


