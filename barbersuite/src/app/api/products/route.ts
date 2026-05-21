import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, zodErrorResponse } from '@/lib/api-utils'

const productSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  stock: z.number().int().min(0, 'Estoque não pode ser negativo'),
  category: z.string().optional(),
  image_url: z.string().url('URL de imagem inválida').optional(),
  is_active: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // RLS handles data isolation based on JWT custom claims (barbershop_id)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')

    if (error) throw error

    return successResponse(data)
  } catch (error: any) {
    return errorResponse(error.message || 'Erro ao buscar produtos', 500)
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
    const parsedData = productSchema.parse(body)

    // Extrair barbershop_id das claims JWT injectadas via Postgres Hook
    const jwtBase64 = session.access_token.split('.')[1]
    const jwtPayload = JSON.parse(Buffer.from(jwtBase64, 'base64').toString())
    const barbershop_id = jwtPayload.barbershop_id

    if (!barbershop_id) {
      return errorResponse('Usuário não associado a uma barbearia', 403)
    }

    // Apenas admins (ou role com permissão) devem criar produtos
    if (jwtPayload.role !== 'admin') {
      return errorResponse('Apenas administradores podem criar produtos', 403)
    }

    const { data, error } = await supabase
      .from('products')
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
    return errorResponse(error.message || 'Erro ao criar produto', 500)
  }
}
