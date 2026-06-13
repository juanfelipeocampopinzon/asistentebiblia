import { LegalPage } from '@/components/site/legal-page'

export default function AiDisclaimerPage() {
  return (
    <LegalPage
      title="Aviso sobre el uso de IA"
      description="Kairos Bible usa inteligencia artificial como asistente de estudio, no como autoridad doctrinal definitiva."
    >
      <h2>Rol de la IA</h2>
      <p>
        La IA puede resumir, comparar, sugerir referencias y organizar observaciones. Sus respuestas deben entenderse
        como una ayuda inicial para estudiar mejor, no como sustituto de la lectura directa ni del discernimiento.
      </p>

      <h2>Limitaciones</h2>
      <ul>
        <li>Puede equivocarse o simplificar temas complejos.</li>
        <li>Puede omitir contexto historico, literario o teologico relevante.</li>
        <li>Puede sugerir referencias que deben ser verificadas.</li>
      </ul>

      <h2>Uso recomendado</h2>
      <p>
        Usa la IA para hacer mejores preguntas, explorar conexiones y preparar estudio personal. Verifica siempre con
        el texto biblico y fuentes confiables.
      </p>
    </LegalPage>
  )
}
