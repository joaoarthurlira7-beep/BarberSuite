const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://buxhbukhowloxquepvmq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eGhidWtob3dsb3hxdWVwdm1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2MDk1MCwiZXhwIjoyMDk0OTM2OTUwfQ._f1tmePa22nU_91VBKv_qmaAvpWEzCbdEaFcFGCyeN8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('Fetching all barbershops...')
  const { data: shops, error: shopsErr } = await supabase.from('barbershops').select('*')
  if (shopsErr) throw shopsErr

  console.log(`Found ${shops.length} barbershops. Seeding each one...`)

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const date = today.getDate()
  const createDate = (h, m) => new Date(year, month, date, h, m).toISOString()

  for (const shop of shops) {
    console.log(`\n--- Seeding Barbearia: "${shop.name}" (ID: ${shop.id}) ---`)

    // 1. Create/Ensure Services
    console.log('Ensuring services exist...')
    const standardServices = [
      { name: 'Corte + Lavagem', price: 60, duration_min: 60, category: 'haircut' },
      { name: 'Ritual de Barba', price: 40, duration_min: 30, category: 'haircut' },
      { name: 'Fade Clássico', price: 50, duration_min: 45, category: 'haircut' },
      { name: 'Full Experience', price: 80, duration_min: 90, category: 'haircut' },
      { name: 'Corte Infantil', price: 45, duration_min: 40, category: 'haircut' }
    ]

    const seededServices = []
    for (const s of standardServices) {
      const { data: existing } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', shop.id)
        .eq('name', s.name)
        .maybeSingle()

      if (existing) {
        seededServices.push(existing)
        console.log(`- Service "${s.name}" already exists.`)
      } else {
        const { data: created, error: sErr } = await supabase
          .from('services')
          .upsert({
            barbershop_id: shop.id,
            name: s.name,
            description: s.name + ' com acabamento e atendimento premium.',
            price: s.price,
            duration_min: s.duration_min,
            category: s.category,
            is_active: true
          })
          .select()
          .single()
        if (sErr) console.error('Error creating service:', sErr)
        else {
          seededServices.push(created)
          console.log(`- Created service "${s.name}"`)
        }
      }
    }

    // 2. Create/Ensure Barbers
    console.log('Ensuring barbers exist...')
    const standardBarbers = ['Flávio', 'Marcela', 'Carla']
    const seededBarbers = []
    
    // Check existing active barbers
    const { data: existingBarbers } = await supabase
      .from('barbers')
      .select('*')
      .eq('barbershop_id', shop.id)
      .eq('is_active', true)

    if (existingBarbers && existingBarbers.length > 0) {
      seededBarbers.push(...existingBarbers)
      console.log(`- Already has ${existingBarbers.length} active barbers.`)
    } else {
      for (const name of standardBarbers) {
        const { data: created, error: bErr } = await supabase
          .from('barbers')
          .upsert({
            barbershop_id: shop.id,
            name,
            role: 'barber',
            is_active: true,
            color: '#d4a017'
          })
          .select()
          .single()
        if (bErr) console.error('Error creating barber:', bErr)
        else {
          seededBarbers.push(created)
          console.log(`- Created barber "${name}"`)
        }
      }
    }

    if (seededBarbers.length === 0 || seededServices.length === 0) {
      console.log('Skipping appointments seeding: no barbers or services available.')
      continue
    }

    // 3. Clear today's appointments
    console.log('Clearing old appointments for today...')
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const { error: delErr } = await supabase
      .from('appointments')
      .delete()
      .eq('barbershop_id', shop.id)
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
    if (delErr) console.error('Error clearing appointments:', delErr)

    // 4. Insert Fake Appointments
    console.log('Inserting beautiful fake appointments for today...')
    const b1 = seededBarbers[0]
    const b2 = seededBarbers[1] || b1
    const b3 = seededBarbers[2] || b1

    const sCorte = seededServices.find(s => s.name === 'Corte + Lavagem') || seededServices[0]
    const sBarba = seededServices.find(s => s.name === 'Ritual de Barba') || seededServices[0]
    const sFull = seededServices.find(s => s.name === 'Full Experience') || seededServices[0]
    const sFade = seededServices.find(s => s.name === 'Fade Clássico') || seededServices[0]

    const fakeAppointments = [
      {
        barbershop_id: shop.id,
        barber_id: b1.id,
        service_id: sCorte.id,
        client_name: 'Bruno Gomes',
        client_phone: '11999999999',
        scheduled_at: createDate(9, 30),
        duration_min: sCorte.duration_min,
        status: 'completed',
        payment_status: 'paid',
        price: sCorte.price,
        source: 'website'
      },
      {
        barbershop_id: shop.id,
        barber_id: b1.id,
        service_id: sBarba.id,
        client_name: 'Lucas Antunes',
        client_phone: '11988888888',
        scheduled_at: createDate(11, 0),
        duration_min: sBarba.duration_min,
        status: 'confirmed',
        payment_status: 'pending',
        price: sBarba.price,
        source: 'admin'
      },
      {
        barbershop_id: shop.id,
        barber_id: b2.id,
        service_id: sFade.id,
        client_name: 'Maria Barbosa',
        client_phone: '11977777777',
        scheduled_at: createDate(10, 0),
        duration_min: sFade.duration_min,
        status: 'completed',
        payment_status: 'paid',
        price: sFade.price,
        source: 'website'
      },
      {
        barbershop_id: shop.id,
        barber_id: b2.id,
        service_id: sFull.id,
        client_name: 'Arthur Silva',
        client_phone: '11966666666',
        scheduled_at: createDate(14, 30),
        duration_min: sFull.duration_min,
        status: 'confirmed',
        payment_status: 'pending',
        price: sFull.price,
        source: 'website'
      },
      {
        barbershop_id: shop.id,
        barber_id: b3.id,
        service_id: sCorte.id,
        client_name: 'Sandra Aparecida',
        client_phone: '11955555555',
        scheduled_at: createDate(10, 30),
        duration_min: sCorte.duration_min,
        status: 'confirmed',
        payment_status: 'pending',
        price: sCorte.price,
        source: 'admin'
      },
      {
        barbershop_id: shop.id,
        barber_id: b3.id,
        service_id: sBarba.id,
        client_name: 'Rodrigo Faro',
        client_phone: '11944444444',
        scheduled_at: createDate(13, 0),
        duration_min: sBarba.duration_min,
        status: 'in_progress',
        payment_status: 'pending',
        price: sBarba.price,
        source: 'admin'
      }
    ]

    const { error: insErr } = await supabase.from('appointments').insert(fakeAppointments)
    if (insErr) console.error('Error inserting fake appointments:', insErr)
    else console.log(`Successfully seeded ${fakeAppointments.length} appointments!`)
  }

  console.log('\nSeeding completed successfully!')
}

seed().catch(console.error)
