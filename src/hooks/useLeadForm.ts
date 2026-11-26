'use client';

import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { useLang } from '@/components/ThemeProvider';

interface UseLeadFormOptions {
  formId: string;
  serviceLabel: string;
  gaCategory: string;
  successMessage?: string;
}

export function useLeadForm({
  formId,
  serviceLabel,
  gaCategory,
  successMessage,
}: UseLeadFormOptions) {
  const { lang } = useLang();
  const isEs = lang === 'es';
  const defaultSuccess = isEs
    ? '¡Solicitud recibida! Espera tu análisis en video en 1 día hábil.'
    : 'Request received! Expect your 3-minute breakdown within 1 business day.';
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attribution, setAttribution] = useState<{
    source?: string;
    campaign?: string;
    ref?: string;
  }>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || sessionStorage.getItem('utm_source') || '';
    const utmCampaign = params.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || '';
    const ref = params.get('ref') || sessionStorage.getItem('ref') || '';

    if (params.get('utm_source')) sessionStorage.setItem('utm_source', params.get('utm_source')!);
    if (params.get('utm_campaign')) sessionStorage.setItem('utm_campaign', params.get('utm_campaign')!);
    if (params.get('ref')) sessionStorage.setItem('ref', params.get('ref')!);

    if (utmSource || utmCampaign || ref) {
      queueMicrotask(() => setAttribution({ source: utmSource, campaign: utmCampaign, ref }));
    }
  }, []);

  const submitLead = async ({
    name,
    email,
    websiteUrl,
    extraMessage,
  }: {
    name?: string;
    email: string;
    websiteUrl: string;
    extraMessage?: string;
  }) => {
    setIsSubmitting(true);
    setIsSuccess(false);
    setStatus(isEs ? 'Enviando solicitud...' : 'Submitting request...');

    const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
    const messageLines = [`Website URL: ${websiteUrl}`, `Submitted From: ${pagePath || formId}`];
    if (extraMessage) messageLines.push(extraMessage);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name?.trim() || email,
          email: email.trim(),
          service: serviceLabel,
          message: messageLines.join('\n'),
          attribution: {
            ...attribution,
            source: attribution.source || pagePath || formId,
          },
        }),
      });
      const result = await res.json();

      if (res.ok) {
        trackEvent({
          action: 'generate_lead',
          category: gaCategory,
          label: serviceLabel,
          params: {
            form_id: formId,
            page_path: pagePath,
            utm_source: attribution.source || undefined,
            utm_campaign: attribution.campaign || undefined,
            ref: attribution.ref || undefined,
          },
        });
        setIsSuccess(true);
        setStatus(successMessage || defaultSuccess);
        return true;
      }

      setStatus(
        isEs
          ? `Error — ${result.message || 'No se pudo enviar la solicitud.'}`
          : `Error — ${result.message || 'Unable to send request.'}`
      );
      return false;
    } catch {
      setStatus(
        isEs
          ? 'Error — falló la conexión. Escribe a rmendez@rottym.com'
          : 'Error — connection failed. Email rmendez@rottym.com'
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { status, isSubmitting, isSuccess, submitLead };
}
