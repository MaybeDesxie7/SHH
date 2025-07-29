import { buffer } from "micro";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email;

    // Determine if it's stars or premium
    if (session.metadata && session.metadata.bundle) {
      const bundle = parseInt(session.metadata.bundle, 10);
      const { data: user } = await supabase.from("profiles").select("id").eq("email", email).single();

      if (user) {
        await supabase.rpc("update_star_balance", { p_user_id: user.id, p_stars: bundle });
      }
    } else if (session.metadata && session.metadata.premium) {
      const { data: user } = await supabase.from("profiles").select("id").eq("email", email).single();
      if (user) {
        await supabase.from("profiles").update({ is_premium: true }).eq("id", user.id);
      }
    }
  }

  res.json({ received: true });
}
