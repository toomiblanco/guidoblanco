import type { Metadata } from 'next'
import { FullArticle } from './articles'

const SITE_NAME = 'Guido Blanco - Periodista'
const DEFAULT_TITLE = 'Guido Blanco - Periodista Político y Económico'
const DEFAULT_DESCRIPTION = 'Análisis político, económico y periodismo de investigación. Cobertura especializada en temas de actualidad argentina.'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tu-dominio.com'

export function generateArticleMetadata(article: FullArticle): Metadata {
  const title = `${article.title} | ${SITE_NAME}`
  const description = article.summary || `Lee el análisis completo de ${article.title} por Guido Blanco`
  const imageUrl = article.cover_image_url ? 
    (article.cover_image_url.startsWith('http') ? 
      article.cover_image_url : 
      `${SITE_URL}${article.cover_image_url}`
    ) : 
    `${SITE_URL}/placeholder.jpg`
  
  const articleUrl = `${SITE_URL}/noticias/${article.slug}`
  const publishedTime = article.published_at || article.created_at
  const modifiedTime = article.updated_at

  return {
    title,
    description,
    authors: article.author_name ? [{ name: article.author_name }] : [{ name: 'Guido Blanco' }],
    keywords: [
      'periodismo',
      'política',
      'economía',
      'análisis',
      'argentina',
      article.category_name,
    ].filter((keyword): keyword is string => Boolean(keyword)),
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      url: articleUrl,
      siteName: SITE_NAME,
      locale: 'es_ES',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
          type: 'image/jpeg',
        }
      ],
      publishedTime,
      modifiedTime,
      authors: article.author_name ? [article.author_name] : ['Guido Blanco'],
      section: article.category_name || 'Noticias',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@guidoblanco', // Cambiar por tu handle de Twitter
      creator: '@guidoblanco',
      title: article.title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: articleUrl,
    },
  }
}

export function generateDefaultMetadata(): Metadata {
  const imageUrl = `${SITE_URL}/placeholder-logo.png`
  
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    authors: [{ name: 'Guido Blanco' }],
    keywords: [
      'periodismo',
      'política',
      'economía',
      'análisis',
      'argentina',
      'noticias',
      'investigación',
      'guido blanco'
    ],
    openGraph: {
      type: 'website',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: 'es_ES',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
          type: 'image/png',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@guidoblanco',
      creator: '@guidoblanco',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION, // Agregar cuando tengas la verificación
    },
  }
}