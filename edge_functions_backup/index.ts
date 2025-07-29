// @ts-nocheck
import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req: Request) => {
  try {
    // Get environment variables (available only in deployed function)
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get bearer token from Authorization header
    const authHeader = req.headers.get('authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '').trim();

    // Verify JWT & get user info
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
    }

    const userId = userData.user.id;

    // Parse JSON body
    let body: { action?: string; starsAmount?: number };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
    }

    const { action, starsAmount } = body;

    if (!action || typeof starsAmount !== 'number' || starsAmount < 0) {
      return new Response(JSON.stringify({ error: 'Invalid action or starsAmount' }), { status: 400 });
    }

    // Fetch current star balance for user
    const { data: starData, error: starError } = await supabase
      .from('stars')
      .select('stars_purchased, stars_remaining')
      .eq('user_id', userId)
      .single();

    if (starError && starError.code !== 'PGRST116') {
      // PGRST116 means no row found, handle below
      return new Response(JSON.stringify({ error: 'Error fetching star balance' }), { status: 500 });
    }

    let starsPurchased = starData?.stars_purchased ?? 0;
    let starsRemaining = starData?.stars_remaining ?? 0;

    if (action === 'deduct') {
      if (starsAmount > starsRemaining) {
        return new Response(JSON.stringify({ error: 'Insufficient stars' }), { status: 400 });
      }
      starsRemaining -= starsAmount;
    } else if (action === 'add') {
      starsPurchased += starsAmount;
      starsRemaining += starsAmount;
    } else {
      return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
    }

    // Upsert the star record (insert or update)
    const { error: upsertError } = await supabase.from('stars').upsert({
      user_id: userId,
      stars_purchased: starsPurchased,
      stars_remaining: starsRemaining,
      last_updated: new Date().toISOString(),
    });

    if (upsertError) {
      return new Response(JSON.stringify({ error: 'Failed to update stars balance' }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        message: 'Stars balance updated successfully',
        stars_purchased: starsPurchased,
        stars_remaining: starsRemaining,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
