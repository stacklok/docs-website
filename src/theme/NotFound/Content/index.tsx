import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import type { Props } from '@theme/NotFound/Content';
import Heading from '@theme/Heading';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';

export default function NotFoundContent({ className }: Props): ReactNode {
  const location = useLocation();
  const isMinderPath = location.pathname.startsWith('/minder');
  const isInsightPath =
    location.pathname.startsWith('/insight') ||
    location.pathname.startsWith('/trusty');

  if (isMinderPath) {
    return (
      <main className={clsx('container margin-vert--xl', className)}>
        <div className='row'>
          <div className='col col--8 col--offset-2'>
            <Heading as='h1' className='hero__title'>
              Minder Cloud is Deprecated
            </Heading>
            <p className='margin-top--md'>
              The Minder Cloud service from Stacklok is no longer available.
              However, you still have options to use Minder:
            </p>
            <ul>
              <li>
                <strong>Run Minder yourself:</strong> Minder is open source and
                available on{' '}
                <Link to='https://github.com/mindersec/minder'>GitHub</Link>
              </li>
              <li>
                <strong>Use Custcodian:</strong> A cloud-hosted version of
                Minder is available at{' '}
                <Link to='https://custcodian.dev/'>
                  https://custcodian.dev/
                </Link>
              </li>
            </ul>
            <p>Thank you for your interest in Minder.</p>
            <p>
              To explore Stacklok&apos;s other projects, please return to the{' '}
              <Link to='/'>Stacklok docs homepage</Link>.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (isInsightPath) {
    return (
      <main className={clsx('container margin-vert--xl', className)}>
        <div className='row'>
          <div className='col col--8 col--offset-2'>
            <Heading as='h1' className='hero__title'>
              Stacklok Insight is Deprecated
            </Heading>
            <p className='margin-top--md'>
              Thank you for your interest in Stacklok Insight (formerly known as
              Trusty).
            </p>
            <p>
              Stacklok recently started to focus on building tools that support
              developers using AI code generation assistants and agents.
              We&apos;ve made the decision to dedicate all our energy and
              resources in this direction, and divest of our work in the Insight
              service.
            </p>
            <p>
              To explore Stacklok&apos;s other projects, please return to the{' '}
              <Link to='/'>Stacklok docs homepage</Link>.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={clsx('container margin-vert--xl', className)}>
      <div className='row'>
        <div className='col col--6 col--offset-3'>
          <Heading as='h1' className='hero__title'>
            <Translate
              id='theme.NotFound.title'
              description='The title of the 404 page'
            >
              Page Not Found
            </Translate>
          </Heading>
          <p>
            <Translate
              id='theme.NotFound.p1'
              description='The first paragraph of the 404 page'
            >
              We could not find what you were looking for.
            </Translate>
          </p>
          <p>
            <Translate
              id='theme.NotFound.p2'
              description='The 2nd paragraph of the 404 page'
            >
              Please contact the owner of the site that linked you to the
              original URL and let them know their link is broken.
            </Translate>
          </p>
        </div>
      </div>
    </main>
  );
}
