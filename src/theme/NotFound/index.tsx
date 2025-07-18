// SPDX-FileCopyrightText: Copyright 2025 Stacklok, Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { type ReactNode } from 'react';
import { translate } from '@docusaurus/Translate';
import { PageMetadata } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import NotFoundContent from '@theme/NotFound/Content';

export default function Index(): ReactNode {
  const title = translate({
    id: 'theme.NotFound.title',
    message: 'Page Not Found',
  });
  return (
    <>
      <PageMetadata title={title} />
      <Layout>
        <NotFoundContent />
      </Layout>
    </>
  );
}
