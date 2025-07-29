'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function checkBetaAccess(): Promise<boolean> {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return false;

  const { data: stars, error } = await supabase
    .from('stars')
    .select('stars_purchased')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !stars) return false;

  return stars.stars_purchased >= 50;
}
