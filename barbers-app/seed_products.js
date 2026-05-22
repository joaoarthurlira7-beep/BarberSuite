const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://buxhbukhowloxquepvmq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eGhidWtob3dsb3hxdWVwdm1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM2MDk1MCwiZXhwIjoyMDk0OTM2OTUwfQ._f1tmePa22nU_91VBKv_qmaAvpWEzCbdEaFcFGCyeN8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedProducts() {
  console.log('Fetching barbershop...')
  const { data: shop } = await supabase.from('barbershops').select('id').eq('slug', 'barbearia-suite').single()
  
  if (!shop) throw new Error('Barbershop not found')

  console.log('Inserting products...')
  
  const products = [
    {
      barbershop_id: shop.id,
      name: 'Pomada Efeito Matte 100g',
      sku: '1234567890123',
      description: 'Pomada modeladora com fixação forte e efeito seco.',
      price: 35.00,
      cost: 15.00,
      stock_qty: 12
    },
    {
      barbershop_id: shop.id,
      name: 'Óleo para Barba Hidratante',
      sku: '7891020304050',
      description: 'Óleo essencial para hidratação e brilho da barba.',
      price: 45.00,
      cost: 20.00,
      stock_qty: 5
    }
  ]

  const { error } = await supabase.from('products').insert(products)

  if (error) console.log('Products might already exist or error:', error.message)
  else console.log('Products inserted successfully! You can test barcodes: 1234567890123 or 7891020304050')
}

seedProducts().catch(console.error)
