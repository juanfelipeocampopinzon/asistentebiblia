import { LegalPage } from '@/components/site/legal-page'

export default function AboutPage() {
  return (
    <LegalPage
      title="Sobre Kairos Bible"
      description="Kairos Bible es una plataforma de lectura y estudio biblico creada para ayudar a leer, comparar y comprender la Biblia con herramientas digitales modernas."
    >
      <h2>Proposito</h2>
      <p>
        Nuestro objetivo es ofrecer una experiencia clara, respetuosa y accesible para leer la Biblia, guardar pasajes,
        comparar traducciones y usar inteligencia artificial como apoyo de estudio.
      </p>

      <h2>Que puedes hacer</h2>
      <ul>
        <li>Leer capitulos biblicos en espanol.</li>
        <li>Guardar favoritos y resaltar versiculos.</li>
        <li>Comparar traducciones disponibles.</li>
        <li>Analizar versiculos con asistencia de IA.</li>
        <li>Buscar pasajes, temas y palabras clave.</li>
      </ul>

      <h2>Enfoque editorial</h2>
      <p>
        Kairos Bible no reemplaza el estudio responsable, la comunidad de fe, el consejo pastoral ni los recursos
        academicos. La IA se usa como ayuda para organizar ideas, resumir contexto y sugerir conexiones biblicas.
      </p>
    </LegalPage>
  )
}
