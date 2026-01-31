import Stripe from "stripe";
import { env } from "@/lib/env";

let stripe: Stripe | null = null;

export const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(env.stripeSecretKey);
  }
  return stripe;
};
