import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import Stripe from 'npm:stripe@14.18.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Missing webhook secret');
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get user ID from session metadata
        const userId = session.metadata?.user_id;
        if (!userId) {
          console.error('No user ID in session metadata');
          break;
        }

        if (session.mode === 'subscription') {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0].price.id;
          
          // Determine subscription tier
          const tier = priceId.includes('startup') ? 'startup' : 'scaleup';
          
          console.log('Updating subscription for user:', userId, 'to tier:', tier);

          // Update subscription status
          const { error: subscriptionError } = await supabase.from('stripe_subscriptions').upsert({
            id: subscription.id,
            customer_id: session.customer as string,
            subscription_id: subscription.id,
            status: subscription.status,
            price_id: priceId,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

          if (subscriptionError) {
            console.error('Error updating subscription:', subscriptionError);
            throw subscriptionError;
          }

          // Update user profile
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              subscription_tier: tier,
              subscription_status: subscription.status
            })
            .eq('id', userId);

          if (profileError) {
            console.error('Error updating profile:', profileError);
            throw profileError;
          }

          console.log('Successfully updated subscription and profile');
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get user ID from customer metadata
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const userId = customer.metadata.user_id;
        if (!userId) {
          console.error('No user ID in customer metadata');
          break;
        }

        console.log('Processing subscription update for user:', userId);

        // Update subscription record
        const { error: subscriptionError } = await supabase.from('stripe_subscriptions').upsert({
          id: subscription.id,
          customer_id: subscription.customer as string,
          subscription_id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
        });

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          throw subscriptionError;
        }

        // Update profile subscription status
        const tier = subscription.status === 'active' 
          ? (subscription.items.data[0].price.id.includes('startup') ? 'startup' : 'scaleup')
          : 'free';

        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: subscription.status,
            subscription_tier: tier
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          throw profileError;
        }

        console.log('Successfully processed subscription update');
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});