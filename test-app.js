

const BASE_URL = 'http://localhost:3001';

async function testWebhookSystem() {
  console.log('🚀 Testing AlgoHire Webhook Relay System\n');

  try {
   
    console.log('📋 Step 1: Creating a subscription...');
    const subscriptionResponse = await fetch(`${BASE_URL}/api/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Webhook Service',
        target_url: 'https://webhook.site/unique-id-here', 
        events: ['user.created', 'user.updated'],
        secret: 'my-secret-key-123'
      })
    });

    if (!subscriptionResponse.ok) {
      throw new Error(`Subscription failed: ${subscriptionResponse.statusText}`);
    }

    const subscription = await subscriptionResponse.json();
    console.log('✅ Subscription created:', subscription);
    console.log(`   ID: ${subscription.id}`);
    console.log(`   Target: ${subscription.target_url}`);
    console.log(`   Events: ${subscription.events.join(', ')}\n`);

 
    console.log('📤 Step 2: Sending a test event...');
    const eventResponse = await fetch(`${BASE_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'user.created',
        payload: {
          userId: 12345,
          email: 'test@example.com',
          name: 'John Doe',
          createdAt: new Date().toISOString()
        }
      })
    });

    if (!eventResponse.ok) {
      throw new Error(`Event failed: ${eventResponse.statusText}`);
    }

    const event = await eventResponse.json();
    console.log('✅ Event created:', event);
    console.log(`   Event ID: ${event.id}\n`);

    
    console.log('⏳ Waiting 2 seconds for delivery processing...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

  
    console.log('📊 Step 3: Checking delivery status...');
    const deliveriesResponse = await fetch(`${BASE_URL}/api/deliveries`);
    
    if (!deliveriesResponse.ok) {
      throw new Error(`Failed to fetch deliveries: ${deliveriesResponse.statusText}`);
    }

    const deliveries = await deliveriesResponse.json();
    console.log(`✅ Found ${deliveries.length} delivery/deliveries\n`);

    if (deliveries.length > 0) {
      const latestDelivery = deliveries[0];
      console.log('📦 Latest Delivery Details:');
      console.log(`   Delivery ID: ${latestDelivery.id}`);
      console.log(`   Status: ${latestDelivery.status}`);
      console.log(`   Target URL: ${latestDelivery.target_url}`);
      console.log(`   Event Type: ${latestDelivery.event_type}`);
      console.log(`   Attempts: ${latestDelivery.attempts}`);
      console.log(`   Created: ${latestDelivery.created_at}`);
      
      if (latestDelivery.status === 'failed') {
        console.log(`   ⚠️  Error: ${latestDelivery.error}`);
        console.log('\n💡 Note: Delivery failed because webhook.site URL is not real.');
        console.log('   This is expected! The system correctly attempted delivery.');
      } else if (latestDelivery.status === 'pending') {
        console.log('\n⏳ Delivery is still being processed by the worker.');
        console.log('   Make sure worker.js is running!');
      } else {
        console.log('\n✅ Delivery succeeded!');
      }
    }

  
    console.log('\n📋 All Subscriptions:');
    const subsResponse = await fetch(`${BASE_URL}/api/subscriptions`);
    const allSubs = await subsResponse.json();
    console.log(`   Total subscriptions: ${allSubs.length}`);
    allSubs.forEach(sub => {
      console.log(`   - ${sub.target_url} (Events: ${sub.events.join(', ')})`);
    });

    console.log('\n✅ Test completed successfully!');
    console.log('\n📊 Next steps:');
    console.log('   1. Visit http://localhost:3001 to see the homepage');
    console.log('   2. Visit http://localhost:3001/dashboard to see the dashboard');
    console.log('   3. Make sure worker.js is running: node worker.js');
    console.log('   4. Try creating more events and subscriptions!');

  } catch (error) {
    console.error(' Test failed:', error.message);
    console.error('\n Troubleshooting:');
    console.error('   - Make sure Next.js dev server is running (npm run dev)');
    console.error('   - Make sure Redis is running');
    console.error('   - Make sure PostgreSQL is running');
    console.error('   - Check http://localhost:3001/api/health');
  }
}


testWebhookSystem();
