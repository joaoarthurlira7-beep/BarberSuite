import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, zodErrorResponse } from '@/lib/api-utils'

const barberSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // RLS handles data isolation based on JWT custom claims (barbershop_id)
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .order('name')

    if (error) throw error

    return successResponse(data)
  } catch (error: any) {
    return errorResponse(error.message || 'Erro ao buscar barbeiros', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Auth check
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return errorResponse('Não autorizado', 401)
    }

    const body = await request.json()
    const parsedData = barberSchema.parse(body)

    const jwtBase64 = session.access_token.split('.')[1]
    const jwtPayload = JSON.parse(Buffer.from(jwtBase64, 'base64').toString())
    const barbershop_id = jwtPayload.barbershop_id

    if (!barbershop_id || jwtPayload.role !== 'admin') {
      return errorResponse('Apenas administradores podem gerenciar a equipe', 403)
    }

    // In a real application, you would also use supabase.auth.admin.createUser 
    // to create the Supabase Auth user for this barber, then store the returned user_id
    // But for this demo, we'll just insert the profile or mock the user_id
    const mockUserId = crypto.randomUUID()

    const { data, error } = await supabase
      .from('barbers')
      .insert({
        ...parsedData,
        user_id: mockUserId, // Would come from auth.admin.createUser
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
    return errorResponse(error.message || 'Erro ao adicionar barbeiro', 500)
  }
}
