import { LegalPage } from '@/components/site/legal-page'

export default function ContactPage() {
  return (
    <LegalPage
      title="Contacto"
      description="Puedes contactarnos para preguntas sobre privacidad, contenido, anuncios, soporte o sugerencias de la plataforma."
    >
      <h2>Correo</h2>
      <p>
        Por ahora, usa el repositorio del proyecto o el canal directo del propietario para solicitudes. Pronto agregaremos
        un correo publico de soporte para Kairos Bible.
      </p>

      <h2>Motivos de contacto</h2>
      <ul>
        <li>Solicitudes de privacidad.</li>
        <li>Correcciones de contenido o traducciones.</li>
        <li>Sugerencias de funciones.</li>
        <li>Consultas sobre anuncios o patrocinios.</li>
      </ul>
    </LegalPage>
  )
}
