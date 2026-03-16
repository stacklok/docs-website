// SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState } from 'react';

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
          id={anchorId}
          style={{
            textAlign: 'center',
            backgroundColor: 'var(--stacklok-green-leaf)',
            color: 'var(--stacklok-white)',
            padding: '1.5rem',
            borderRadius: '24px',
            display: 'inline-block',
            width: 'auto',
            scrollMarginTop: anchorId ? '7rem' : undefined,
          }}
        >
          <span
            style={{ display: 'block', fontWeight: '700', fontSize: '1.25rem' }}
          >
            {title}
          </span>
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
