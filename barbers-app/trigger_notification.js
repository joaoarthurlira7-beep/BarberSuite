const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://buxhbukhowloxquepvmq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eGhidWtob3dsb3hxdWVwdm1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2MDk1MCwiZXhwIjoyMDk0OTM2OTUwfQ._f1tmePa22nU_91VBKv_qmaAvpWEzCbdEaFcFGCyeN8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function trigger() {
  console.log('Fetching barbershop...')
  const { data: shop } = await supabase.from('barbershops').select('id').eq('slug', 'barbearia-suite').single()
  
  if (!shop) throw new Error('Barbershop not found')

  const { data: barbers } = await supabase.from('barbers').select('id').eq('barbershop_id', shop.id)
  
  console.log('Disparando novo agendamento...')
  
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const date = today.getDate()
  // Agenda para 15:30 de hoje
  const scheduledAt = new Date(year, month, date, 15, 30).toISOString()

  const { error } = await supabase.from('appointments').insert({
    barbershop_id: shop.id,
    barber_id: barbers[0].id,
    client_name: 'Novo Cliente Teste',
    client_phone: '11999999999',
    scheduled_at: scheduledAt,
    duration_min: 45,
    status: 'pending'
  })

  if (error) throw error
  console.log('Agendamento criado com sucesso! Verifique o seu celular.')
}

trigger().catch(console.error)
