import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function successResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function zodErrorResponse(error: any) {
  const formattedErrors = error.errors?.map((err: any) => ({
    field: err.path?.join('.') || 'unknown',
    message: err.message
  }))
  return NextResponse.json({ 
    success: false, 
    error: 'Validation failed', 
    details: formattedErrors 
  }, { status: 400 })
}
