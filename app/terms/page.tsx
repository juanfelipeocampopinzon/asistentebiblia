import { LegalPage } from '@/components/site/legal-page'

export default function TermsPage() {
  return (
    <LegalPage
      title="Terminos de uso"
      description="Estos terminos describen las condiciones generales para usar Kairos Bible como herramienta de lectura y estudio biblico."
    >
      <p>Ultima actualizacion: 13 de junio de 2026.</p>

      <h2>Uso aceptable</h2>
      <p>
        Puedes usar Kairos Bible para lectura, busqueda, estudio personal, favoritos, notas y analisis asistido por IA.
        No debes usar la plataforma para abuso, automatizacion excesiva, ataques, extraccion masiva o actividades ilegales.
      </p>

      <h2>Contenido biblico y traducciones</h2>
      <p>
        Algunas traducciones pueden depender de fuentes publicas, permisos o licencias. Las versiones no disponibles se
        mostraran como pendientes hasta contar con una fuente autorizada.
      </p>

      <h2>IA como apoyo</h2>
      <p>
        Las respuestas de IA pueden contener errores, omisiones o interpretaciones incompletas. Recomendamos contrastar
        las respuestas con el texto biblico, recursos confiables y liderazgo espiritual responsable.
      </p>

      <h2>Cambios del servicio</h2>
      <p>
        Podemos mejorar, modificar o retirar funciones para mantener seguridad, calidad y sostenibilidad del servicio.
      </p>
    </LegalPage>
  )
}
