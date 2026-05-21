import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, zodErrorResponse } from '@/lib/api-utils'

const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  duration_min: z.number().int().min(5, 'Duração mínima de 5 minutos'),
  description: z.string().optional(),
  category: z.string().optional(),
  is_active: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // RLS handles data isolation based on JWT custom claims (barbershop_id)
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name')

    if (error) throw error

    return successResponse(data)
  } catch (error: any) {
    return errorResponse(error.message || 'Erro ao buscar serviços', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Auth check (Supabase client will automatically send the JWT)
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return errorResponse('Não autorizado', 401)
    }

    const body = await request.json()
    
    // Zod validation
    const parsedData = serviceSchema.parse(body)

    // A barbershop_id is not provided in body because RLS/Trigger will infer it or we must provide it.
    // However, our policy requires owner_id or barbershop_id. Let's get it from the user session.
    // In our architecture, the barbershop_id should be in the JWT claims, but since we are writing,
    // we need to set it in the payload explicitly if RLS doesn't auto-set it via triggers.
    // For now, let's extract it from JWT:
    const jwtBase64 = session.access_token.split('.')[1]
    const jwtPayload = JSON.parse(Buffer.from(jwtBase64, 'base64').toString())
    const barbershop_id = jwtPayload.barbershop_id

    if (!barbershop_id) {
      return errorResponse('Usuário não associado a uma barbearia', 403)
    }

    const { data, error } = await supabase
      .from('services')
      .insert({
        ...parsedData,
        barbershop_id
      })
      .select()
      .single()

    if (error) throw error

    return successResponse(data, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return zodErrorResponse(error)
    }
    return errorResponse(error.message || 'Erro ao criar serviço', 500)
  }
}
