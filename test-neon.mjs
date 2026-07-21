// Quick connectivity test for Neon database
async function testConnection() {
  const host = 'ep-mute-sea-av38prz9-pooler.c-11.us-east-1.aws.neon.tech'
  
  console.log('=== Neon Connectivity Test ===\n')
  
  // Test 1: Can we resolve DNS?
  console.log('1. Testing DNS resolution...')
  try {
    const dns = require('dns').promises
    const addresses = await dns.resolve4(host)
    console.log('   ✅ DNS resolved to:', addresses.join(', '))
  } catch (e) {
    console.log('   ❌ DNS failed:', e.message)
  }

  // Test 2: Can we reach port 443?
  console.log('\n2. Testing TCP connection to port 443...')
  try {
    const net = require('net')
    await new Promise((resolve, reject) => {
      const socket = net.createConnection({ host, port: 443, timeout: 15000 })
      socket.on('connect', () => {
        console.log('   ✅ TCP connection successful!')
        socket.destroy()
        resolve()
      })
      socket.on('timeout', () => {
        console.log('   ❌ TCP connection TIMED OUT (15s)')
        socket.destroy()
        reject(new Error('timeout'))
      })
      socket.on('error', (err) => {
        console.log('   ❌ TCP error:', err.message)
        reject(err)
      })
    })
  } catch (e) {
    // already logged
  }

  // Test 3: Can we make HTTPS request?
  console.log('\n3. Testing HTTPS fetch to Neon...')
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(`https://${host}/sql`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'SELECT 1' })
    })
    clearTimeout(timeout)
    console.log('   ✅ HTTPS response status:', res.status)
  } catch (e) {
    console.log('   ❌ HTTPS fetch failed:', e.cause?.code || e.message)
  }

  // Test 4: General internet connectivity
  console.log('\n4. Testing general internet (google.com)...')
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch('https://www.google.com', { signal: controller.signal })
    clearTimeout(timeout)
    console.log('   ✅ Google reachable, status:', res.status)
  } catch (e) {
    console.log('   ❌ Google unreachable:', e.message)
  }

  console.log('\n=== Test Complete ===')
}

testConnection()
