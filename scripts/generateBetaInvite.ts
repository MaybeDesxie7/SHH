// scripts/generateBetaInvite.ts
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function inviteUser(email: string) {
  const { data: user } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single();

  if (!user) {
    console.error('User not found');
    return;
  }

  const token = uuidv4();
  await supabase
    .from('profiles')
    .update({ beta_invite_token: token })
    .eq('user_id', user.id);

  const inviteLink = `https://shh-eight.vercel.app/beta-join?token=${token}`;
  console.log(`Send this invite to ${email}: ${inviteLink}`);
}

inviteUser('example@domain.com');
