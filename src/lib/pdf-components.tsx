import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage, Link } from '@react-pdf/renderer';

// ===== PDF STYLES =====

export const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  brandUrl: {
    fontSize: 10,
    color: '#6b7280',
    textDecoration: 'none',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 1.2,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 1.5,
  },
  infographicContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  infographicImage: {
    maxWidth: '100%',
    maxHeight: '60vh',
    objectFit: 'contain',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    alignItems: 'center',
  },
  blogLink: {
    fontSize: 12,
    color: '#2563eb',
    textDecoration: 'underline',
    marginBottom: 4,
  },
  blogLinkLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 8,
  },
  qrCode: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  qrLabel: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  copyright: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  attribution: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});

// ===== HELPER FUNCTIONS =====

export function getLanguageLabel(language: string): string {
  const labels: Record<string, string> = {
    en: 'Read the full article',
    uk: 'Read the full article',
    de: 'Lesen Sie den vollständigen Artikel',
    fr: 'Lire l\'article complet',
    es: 'Leer el artículo completo',
    it: 'Leggi l\'articolo completo',
  };
  return labels[language] || labels.en;
}

export function getCopyrightText(language: string, year: number, organizationName: string): string {
  const texts: Record<string, string> = {
    en: `© ${year} ${organizationName}. All rights reserved.`,
    uk: `© ${year} ${organizationName}. All rights reserved.`,
    de: `© ${year} ${organizationName}. Alle Rechte vorbehalten.`,
    fr: `© ${year} ${organizationName}. Tous droits réservés.`,
    es: `© ${year} ${organizationName}. Todos los derechos reservados.`,
    it: `© ${year} ${organizationName}. Tutti i diritti riservati.`,
  };
  return texts[language] || texts.en;
}

export function getAttributionText(language: string): string {
  const texts: Record<string, string> = {
    en: 'Scan QR code for mobile access',
    uk: 'Scan QR code for mobile access',
    de: 'QR-Code für mobilen Zugriff scannen',
    fr: 'Scanner le code QR pour l\'accès mobile',
    es: 'Escanear código QR para acceso móvil',
    it: 'Scansiona il codice QR per l\'accesso mobile',
  };
  return texts[language] || texts.en;
}

// ===== TYPE DEFINITIONS =====

export interface InfographicPDFData {
  _id: string;
  title: string;
  description?: string;
  altText: string;
  image: {
    _id: string;
    url: string;
    metadata: {
      dimensions: {
        width: number;
        height: number;
        aspectRatio: number;
      };
    };
  };
  downloadFilename?: string;
  pdfMetadata?: {
    title?: string;
    keywords?: string;
    author?: string;
    subject?: string;
  };
}

export interface PDFGenerationOptions {
  language: string;
  blogPostUrl?: string;
  sourceUrl?: string;
  organizationName?: string;
  organizationUrl?: string;
}

// ===== PDF DOCUMENT COMPONENT =====

interface InfographicPDFProps {
  infographic: InfographicPDFData;
  options: PDFGenerationOptions;
  qrCodeDataUrl?: string;
}

export const InfographicPDF = ({ infographic, options, qrCodeDataUrl }: InfographicPDFProps) => {
  const currentYear = new Date().getFullYear();
  const organizationName = options.organizationName || 'Dog Body Mind';
  const organizationUrl = options.organizationUrl || 'https://dogbodymind.com';

  return React.createElement(
    Document,
    {
      title: infographic.pdfMetadata?.title || infographic.title,
      author: infographic.pdfMetadata?.author || organizationName,
      subject: infographic.pdfMetadata?.subject || infographic.description,
      keywords: infographic.pdfMetadata?.keywords,
      creator: organizationName,
      producer: "Dog Body Mind PDF Generator"
    },
    React.createElement(
      Page,
      { size: "A4", style: pdfStyles.page },

      // Header
      React.createElement(
        View,
        { style: pdfStyles.header },
        React.createElement(Text, { style: pdfStyles.logo }, organizationName),
        React.createElement(
          Link,
          { src: organizationUrl, style: pdfStyles.brandUrl },
          organizationUrl.replace(/^https?:\/\//, '')
        )
      ),

      // Title
      React.createElement(Text, { style: pdfStyles.title }, infographic.title),

      // Description
      infographic.description && React.createElement(
        Text,
        { style: pdfStyles.description },
        infographic.description
      ),

      // Infographic Image
      React.createElement(
        View,
        { style: pdfStyles.infographicContainer },
        React.createElement(PDFImage, {
          src: infographic.image.url,
          style: pdfStyles.infographicImage
        })
      ),

      // Footer
      React.createElement(
        View,
        { style: pdfStyles.footer },

        // Footer Left
        React.createElement(
          View,
          { style: pdfStyles.footerLeft },

          // Blog link
          options.blogPostUrl && React.createElement(
            React.Fragment,
            null,
            React.createElement(
              Text,
              { style: pdfStyles.blogLinkLabel },
              getLanguageLabel(options.language) + ":"
            ),
            React.createElement(
              Link,
              { src: options.blogPostUrl, style: pdfStyles.blogLink },
              options.blogPostUrl
            )
          ),

          // Copyright
          React.createElement(
            Text,
            { style: pdfStyles.copyright },
            getCopyrightText(options.language, currentYear, organizationName)
          ),

          // Attribution
          React.createElement(
            Text,
            { style: pdfStyles.attribution },
            `Generated from ${organizationName}`
          )
        ),

        // Footer Right - QR Code
        qrCodeDataUrl && options.blogPostUrl && React.createElement(
          View,
          { style: pdfStyles.footerRight },
          React.createElement(PDFImage, { src: qrCodeDataUrl, style: pdfStyles.qrCode }),
          React.createElement(
            Text,
            { style: pdfStyles.qrLabel },
            getAttributionText(options.language)
          )
        )
      )
    )
  );
};
