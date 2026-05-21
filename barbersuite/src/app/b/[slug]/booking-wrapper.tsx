'use client'

import { useState } from 'react'
import BookingModal from './booking-modal'

export default function BookingModalClientWrapper({
  barbershop,
  barbers,
  services,
  className = "btn-neon py-2 text-xs"
}: {
  barbershop: any
  barbers: any[]
  services: any[]
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={className}
      >
        Agendar Horário
      </button>

      <BookingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        barbershop={barbershop}
        barbers={barbers}
        services={services}
      />
    </>
  )
}
