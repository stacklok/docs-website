// SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState } from 'react';

interface HubSpotFormProps {
  portalId: string;
  formId: string;
  region: string;
  instanceId: string;
}

const SCRIPT_SRC = '//js-na2.hsforms.net/forms/embed/v2.js';

export default function HubSpotForm({
  portalId,
  formId,
  region,
  instanceId,
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

  if (submitted) {
    return (
      <div style={{textAlign: 'center', padding: '2rem'}}>
        {/* <p>We will be in touch by email within one business day to schedule your demo.</p> */}
      </div>
    );
  }

  return <div id={targetId} ref={containerRef} />;
}
