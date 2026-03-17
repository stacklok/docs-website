// SPDX-FileCopyrightText: Copyright 2026 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

/*
 * Renders an embedded HubSpot form using the HubSpot Forms API. The embed
 * script is loaded lazily on mount and shared across multiple instances on the
 * same page. Tracks submission state to trigger HubSpot's own confirmation
 * message in place of the form.
 *
 * When `title` is provided, the form is wrapped in a branded card with an
 * optional `subtitle`. Supply `anchorId` to make the title a named anchor
 * target for in-page links (e.g. a CTA linking to "#schedule-a-demo").
 * The title renders as a `<Heading>` so Docusaurus recognizes the anchor
 * during its build-time link validation.
 */

import React, { useEffect, useRef, useState } from 'react';
import Heading from '@theme/Heading';

interface HubSpotFormProps {
  portalId: string;
  formId: string;
  region: string;
  instanceId: string;
  title?: string;
  subtitle?: string;
  anchorId?: string;
}

const SCRIPT_SRC = '//js-na2.hsforms.net/forms/embed/v2.js';

export default function HubSpotForm({
  portalId,
  formId,
  region,
  instanceId,
  title,
  subtitle,
  anchorId,
}: HubSpotFormProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const targetId = `hubspot-form-${instanceId}`;

  useEffect(() => {
    if (!containerRef.current) return;

    const init = () => {
      window['hbspt'].forms.create({
        portalId,
        formId,
        region,
        target: `#${targetId}`,
        onFormSubmitted: () => setSubmitted(true),
      });
    };

    if (window['hbspt']) {
      init();
      return;
    }

    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', init);
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.charset = 'utf-8';
    script.type = 'text/javascript';
    script.addEventListener('load', init);
    document.body.appendChild(script);
  }, [portalId, formId, region]);

  const formContent = submitted ? (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      {/* This div is intentionally empty to trigger HubSpot form confirmation message */}
    </div>
  ) : (
    <div id={targetId} ref={containerRef} />
  );

  if (title) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'var(--stacklok-green-leaf)',
            color: 'var(--stacklok-white)',
            padding: '1.5rem',
            borderRadius: '24px',
            display: 'inline-block',
            width: 'auto',
          }}
        >
          <Heading
            as='h2'
            id={anchorId}
            style={{
              display: 'block',
              fontWeight: '700',
              fontSize: '1.25rem',
              color: 'inherit',
              scrollMarginTop: anchorId ? '9rem' : undefined,
            }}
          >
            {title}
          </Heading>
          {subtitle && (
            <span
              style={{
                display: 'block',
                fontWeight: '400',
                fontSize: '0.95rem',
                marginTop: '0.25rem',
              }}
            >
              {subtitle}
            </span>
          )}
          <div
            style={{
              maxWidth: '480px',
              margin: '1rem auto 0',
              textAlign: 'left',
            }}
          >
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return formContent;
}
