import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import BrowserOnly from '@docusaurus/BrowserOnly';

type Props = WrapperProps<typeof ContentType>;

/**
 * Swizzled DocItem/Content — wraps the chapter body with LanguageWrapper (outer)
 * and PersonalizationWrapper (inner).
 *
 * BrowserOnly ensures these wrappers render only client-side, avoiding SSR
 * hydration mismatches caused by window.location / session checks.
 */
export default function ContentWrapper(props: Props): React.JSX.Element {
  return (
    <BrowserOnly fallback={<Content {...props} />}>
      {() => {
        // Dynamic imports inside BrowserOnly to avoid SSR issues
        const LanguageWrapper = require('@site/src/components/Translation/LanguageWrapper').default;
        const PersonalizationWrapper = require('@site/src/components/Personalization/PersonalizationWrapper').default;
        return (
          <LanguageWrapper
            englishContent={
              <PersonalizationWrapper defaultContent={<Content {...props} />} />
            }
          />
        );
      }}
    </BrowserOnly>
  );
}
