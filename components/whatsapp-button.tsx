'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  // Número de WhatsApp con formato internacional
  const phoneNumber = '5491154234781' // +54 9 11 5423-4781 sin espacios ni guiones
  
  // Mensaje predeterminado (opcional)
  const defaultMessage = 'Hola me comunico desde tu web personal por el siguiente motivo:'
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`
    window.open(url, '_blank')
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón principal */}
      <button
        onClick={handleWhatsAppClick}
        className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 ease-in-out group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={24} className="group-hover:rotate-12 transition-transform duration-300" />
      </button>
    </div>
  )
}