import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { email } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Premium Subscription" },
          recurring: { interval: "month" },
          unit_amount: 999,
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/premium?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/premium?canceled=true`,
    customer_email: email,
  });

  res.json({ url: session.url });
}
