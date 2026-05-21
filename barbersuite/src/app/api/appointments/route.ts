import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, zodErrorResponse } from '@/lib/api-utils'

const appointmentSchema = z.object({
  barber_id: z.string().uuid('ID de barbeiro inválido'),
  service_id: z.string().uuid('ID de serviço inválido'),
  scheduled_at: z.string().datetime({ offset: true }),
  client_name: z.string().min(2, 'Nome muito curto'),
  client_phone: z.string().min(10, 'Telefone inválido'),
  client_email: z.string().email('Email inválido').optional(),
  duration_min: z.number().int().min(5),
  price: z.number().min(0)
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return errorResponse('Não autorizado', 401)
    }

    // Role-based filtering handled implicitly by RLS if configured correctly,
    // or explicitly here.
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    
    let query = supabase.from('appointments').select('*, barbers(name), services(name)')
    
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true })

    if (error) throw error

    return successResponse(data)
  } catch (error: any) {
    return errorResponse(error.message || 'Erro ao buscar agendamentos', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsedData = appointmentSchema.parse(body)

    const supabase = await createClient()
    
    // Check for schedule conflicts
    const endTime = new Date(new Date(parsedData.scheduled_at).getTime() + parsedData.duration_min * 60000).toISOString()
    
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('barber_id', parsedData.barber_id)
      .not('status', 'eq', 'canceled')
      .or(`and(scheduled_at.lt.${endTime},scheduled_at.gte.${parsedData.scheduled_at})`)

    if (conflicts && conflicts.length > 0) {
      return errorResponse('Horário indisponível para este profissional', 409)
    }

    // A barbershop_id is not passed here by the client, it is inferred from the barber_id.
    const { data: barber } = await supabase
      .from('barbers')
      .select('barbershop_id')
      .eq('id', parsedData.barber_id)
      .single()

    if (!barber) return errorResponse('Barbeiro não encontrado', 404)

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...parsedData,
        barbershop_id: barber.barbershop_id,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return successResponse(data, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return zodErrorResponse(error)
    }
    return errorResponse(error.message || 'Erro ao criar agendamento', 500)
  }
}
