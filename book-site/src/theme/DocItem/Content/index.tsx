import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import PersonalizationWrapper from '@site/src/components/Personalization/PersonalizationWrapper';

type Props = WrapperProps<typeof ContentType>;

/**
 * Swizzled DocItem/Content — wraps the default chapter body with PersonalizationWrapper.
 *
 * When a student is logged in, PersonalizationWrapper fetches personalized content
 * from the FastAPI backend and renders it in place of the default MDX content.
 * URL, sidebar, and navigation are unaffected — only the body is replaced.
 *
 * For unauthenticated users, the default content is rendered unchanged.
 */
export default function ContentWrapper(props: Props): React.JSX.Element {
  return (
    <PersonalizationWrapper defaultContent={<Content {...props} />}>
    </PersonalizationWrapper>
  );
}
