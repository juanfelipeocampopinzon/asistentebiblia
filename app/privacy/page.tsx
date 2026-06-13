import { LegalPage } from '@/components/site/legal-page'

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politica de privacidad"
      description="Esta politica explica que informacion puede recopilar Kairos Bible y como se utiliza para ofrecer lectura, guardados, autenticacion, IA y anuncios no intrusivos."
    >
      <p>Ultima actualizacion: 13 de junio de 2026.</p>

      <h2>Informacion que recopilamos</h2>
      <p>
        Podemos recopilar informacion tecnica basica, preferencias de lectura, favoritos, resaltados, historial de uso
        de funciones de IA y datos de cuenta cuando inicias sesion con Google.
      </p>

      <h2>Inicio de sesion con Google</h2>
      <p>
        Si inicias sesion, usamos tu cuenta de Google para identificar tu sesion y habilitar funciones personalizadas.
        No vendemos tu informacion personal.
      </p>

      <h2>Uso de inteligencia artificial</h2>
      <p>
        Las preguntas y textos enviados a las funciones de IA pueden procesarse mediante servicios de Google Cloud /
        Vertex AI para generar respuestas. Evita enviar informacion sensible o privada en el chat.
      </p>

      <h2>Cookies, analitica y anuncios</h2>
      <p>
        Kairos Bible puede usar cookies o tecnologias similares para mantener preferencias, medir funcionamiento y
        mostrar anuncios respetuosos. Si activamos Google AdSense, Google y sus socios pueden usar cookies para
        publicar y medir anuncios segun sus propias politicas.
      </p>

      <h2>Almacenamiento local</h2>
      <p>
        Algunas preferencias, resaltados o progreso pueden guardarse localmente en tu navegador para mejorar la
        experiencia de lectura.
      </p>

      <h2>Contacto</h2>
      <p>
        Para solicitudes relacionadas con privacidad, visita la pagina de contacto.
      </p>
    </LegalPage>
  )
}
