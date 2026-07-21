import { Helmet } from "react-helmet-async";

const SITE_NAME = "Jardín de las Delicias";
const SITE_URL = "https://www.jardindelasdelicias.com";
const DEFAULT_IMAGE = `${SITE_URL}/preview.jpg`;
const DEFAULT_DESCRIPTION =
  "Sitio Oficial de las Cataratas Jardín de las Delicias en El Torno, Santa Cruz. Mapa GPS en vivo, precios actualizados, transporte y guía segura de la ruta.";

export default function Seo({ title, description = DEFAULT_DESCRIPTION, path = "/", image = DEFAULT_IMAGE, type = "website", noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Cataratas y Turismo en El Torno`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, follow" : "index, follow"} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
