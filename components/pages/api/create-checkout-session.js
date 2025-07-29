import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { bundle, email } = req.body;
  const amountMap = { 50: 500, 120: 1000, 300: 2000 }; // in cents

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `${bundle} Stars` },
          unit_amount: amountMap[bundle],
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/premium?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/premium?canceled=true`,
    customer_email: email,
  });

  res.json({ url: session.url });
}
