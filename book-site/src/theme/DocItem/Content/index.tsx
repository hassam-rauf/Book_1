import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import PersonalizationWrapper from '@site/src/components/Personalization/PersonalizationWrapper';
import LanguageWrapper from '@site/src/components/Translation/LanguageWrapper';

type Props = WrapperProps<typeof ContentType>;

/**
 * Swizzled DocItem/Content — wraps the chapter body with LanguageWrapper (outer)
 * and PersonalizationWrapper (inner).
 *
 * LanguageWrapper: reads localStorage['preferred-lang']. When 'ur', fetches the
 * pre-generated Urdu markdown file from /Book_1/translations/ur/{slug}.md and
 * renders it RTL. Falls back to English on 404. Toggle button always visible.
 *
 * PersonalizationWrapper (inner, English only): fetches personalized content for
 * logged-in students from the FastAPI backend. Skipped when Urdu is active.
 *
 * URL, sidebar, and navigation are unaffected — only the body changes.
 */
export default function ContentWrapper(props: Props): React.JSX.Element {
  return (
    <LanguageWrapper
      englishContent={
        <PersonalizationWrapper defaultContent={<Content {...props} />} />
      }
    />
  );
}
