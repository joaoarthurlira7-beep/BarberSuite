const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://buxhbukhowloxquepvmq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eGhidWtob3dsb3hxdWVwdm1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2MDk1MCwiZXhwIjoyMDk0OTM2OTUwfQ._f1tmePa22nU_91VBKv_qmaAvpWEzCbdEaFcFGCyeN8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setup() {
  console.log('Fetching demo user...')
  const { data: usersData } = await supabase.auth.admin.listUsers()
  const demoUser = usersData.users.find(u => u.email === 'demo@barbersuite.com.br')
  if (!demoUser) throw new Error('Demo user not found')
  
  // Upsert Barbershop
  console.log('Creating/Updating Barbershop...')
  const { data: shop, error: shopErr } = await supabase.from('barbershops').upsert({
    slug: 'barbearia-suite',
    name: 'Barbearia Suite',
    owner_id: demoUser.id,
    plan: 'pro',
    plan_status: 'active'
  }, { onConflict: 'slug' }).select().single()
  if (shopErr) throw shopErr

  // Create Barbers
  console.log('Creating Barbers...')
  const { data: b1 } = await supabase.from('barbers').upsert({ barbershop_id: shop.id, name: 'Flávio' }).select().single()
  const { data: b2 } = await supabase.from('barbers').upsert({ barbershop_id: shop.id, name: 'Marcela' }).select().single()
  const { data: b3 } = await supabase.from('barbers').upsert({ barbershop_id: shop.id, name: 'Carla' }).select().single()

  const barbers = [b1, b2, b3]

  // Clear today's appointments
  console.log('Clearing old appointments...')
  await supabase.from('appointments').delete().eq('barbershop_id', shop.id)

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const date = today.getDate()
  
  console.log('Inserting demo appointments for today...')
  const createDate = (h, m) => new Date(year, month, date, h, m).toISOString()

  const appointments = [
    {
      barbershop_id: shop.id,
      barber_id: b1.id,
      client_name: 'Bruno Gomes',
      client_phone: '11999999999',
      scheduled_at: createDate(9, 30),
      duration_min: 60,
      status: 'pending'
    },
    {
      barbershop_id: shop.id,
      barber_id: b2.id,
      client_name: 'Maria Barbosa',
      client_phone: '11999999999',
      scheduled_at: createDate(11, 0),
      duration_min: 60,
      status: 'pending'
    },
    {
      barbershop_id: shop.id,
      barber_id: b3.id,
      client_name: 'Sandra Aparecida',
      client_phone: '11999999999',
      scheduled_at: createDate(10, 30),
      duration_min: 90,
      status: 'pending'
    }
  ]

  const { error: insertError } = await supabase.from('appointments').insert(appointments)
  if (insertError) throw insertError
  console.log('Demo data setup complete!')
}

setup().catch(console.error)
