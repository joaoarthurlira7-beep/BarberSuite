const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://buxhbukhowloxquepvmq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eGhidWtob3dsb3hxdWVwdm1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2MDk1MCwiZXhwIjoyMDk0OTM2OTUwfQ._f1tmePa22nU_91VBKv_qmaAvpWEzCbdEaFcFGCyeN8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log('--- TODAY APPOINTMENTS WITH SERVICES ---')
  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  const { data: appts, error } = await supabase
    .from('appointments')
    .select('*, services(name, price), barbers(name)')
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())

  if (error) {
    console.error(error)
  } else {
    console.log(`Found ${appts.length} appointments for today:`)
    appts.forEach(a => {
      console.log(`- ${a.client_name} at ${a.scheduled_at}: Barber=${a.barbers?.name}, Service=${a.services?.name}, Price=${a.price}, Source=${a.source}`)
    })
  }
}

run().catch(console.error)
