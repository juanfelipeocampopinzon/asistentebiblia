import { LegalPage } from '@/components/site/legal-page'

export default function AdvertisingPage() {
  return (
    <LegalPage
      title="Anuncios y patrocinios"
      description="Kairos Bible busca sostener la plataforma con anuncios respetuosos, ubicados manualmente y sin interrumpir la lectura."
    >
      <h2>Principios</h2>
      <ul>
        <li>No usamos popups ni anuncios invasivos.</li>
        <li>No insertamos anuncios entre cada versiculo.</li>
        <li>No colocamos anuncios dentro del chat de IA.</li>
        <li>Priorizamos ubicaciones discretas al inicio o al final del contenido.</li>
      </ul>

      <h2>Google AdSense</h2>
      <p>
        Cuando AdSense este activo, Google puede mostrar anuncios y usar cookies o tecnologias similares para medicion,
        seguridad y personalizacion segun sus politicas.
      </p>

      <h2>Patrocinios directos</h2>
      <p>
        Tambien podremos considerar patrocinios relacionados con educacion biblica, lectura, recursos cristianos o
        herramientas de estudio, siempre cuidando la experiencia del usuario.
      </p>
    </LegalPage>
  )
}
