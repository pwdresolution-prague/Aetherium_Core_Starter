// supabase/functions/payment-webhook/index.ts
import Stripe from "npm:stripe";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const cryptoProvider = Stripe.createSubtleCryptoProvider(); // Deno nemá Node crypto
const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const WEBHOOK_SECRET = Deno.env.get("STRIPE_PAYMENT_WEBHOOK_SECRET")!;

const HANDLED = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

Deno.serve(async (req) => {
  // 1) Podpis: bez platného podpisu se nic nestane
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });
  const body = await req.text(); // RAW tělo, jinak podpis nesedí
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      WEBHOOK_SECRET,
      undefined,
      cryptoProvider,
    );
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  // 2) Zajímají nás jen dokončené platby
  if (!HANDLED.has(event.type)) return new Response("ignored");
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") return new Response("not paid yet"); // async metoda čeká

  // 3) Najdi objednávku podle ID session
  const { data: order, error: readErr } = await db.from("registration_orders")
    .select("id,status,amount_minor,currency")
    .eq("payment_ref", session.id).maybeSingle();
  if (readErr) return new Response("db error", { status: 500 }); // 5xx = Stripe zkusí znovu
  if (!order) return new Response("no matching order"); // 200, opakování nepomůže

  // 4) Obrana: zaplacená částka musí sedět s tím, co je v DB
  if (
    session.amount_total !== order.amount_minor ||
    session.currency?.toUpperCase() !== order.currency
  ) {
    console.error("AMOUNT MISMATCH", {
      order: order.id,
      got: session.amount_total,
      want: order.amount_minor,
    });
    return new Response("amount mismatch"); // stav se nemění, řeší člověk
  }

  // 5) KROK A: payment_pending → paid (projde jen jednou)
  const { error: payErr } = await db.from("registration_orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", order.id).eq("status", "payment_pending");
  if (payErr) return new Response("db error", { status: 500 });

  // 6) KROK B: dokonči vše, co zbývá z 'paid'. Při opakovaném doručení naváže tam, kde to spadlo.
  const { data: cur } = await db.from("registration_orders")
    .select("status").eq("id", order.id).single();
  if (cur?.status === "paid") {
    // TODO: atomicky vystavit token (jedna SQL funkce: insert do registration_tokens
    //       + status = 'token_issued'), pak spustit fakturu v Node-RED
  }

  return new Response("ok");
});
