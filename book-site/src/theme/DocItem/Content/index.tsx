import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import BrowserOnly from '@docusaurus/BrowserOnly';
import PersonalizationWrapper from '@site/src/components/Personalization/PersonalizationWrapper';
import LanguageWrapper from '@site/src/components/Translation/LanguageWrapper';

type Props = WrapperProps<typeof ContentType>;

/**
 * Swizzled DocItem/Content — wraps the chapter body with LanguageWrapper (outer)
 * and PersonalizationWrapper (inner), rendered client-side only via BrowserOnly.
 */
export default function ContentWrapper(props: Props): React.JSX.Element {
  return (
    <BrowserOnly fallback={<Content {...props} />}>
      {() => (
        <LanguageWrapper
          englishContent={
            <PersonalizationWrapper defaultContent={<Content {...props} />} />
          }
        />
      )}
    </BrowserOnly>
  );
}
