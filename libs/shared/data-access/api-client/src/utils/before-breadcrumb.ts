import { stripOrigin } from '@open-webui-react-native/shared/utils/strings';
import type { Breadcrumb } from '@sentry/react-native';

const networkBreadcrumbCategories = new Set(['xhr', 'http', 'fetch']);

// Sentry records the absolute request URL in network breadcrumbs, which exposes the address
// of the user's self-hosted server. Keep only the path and query so the host does not leak.
export const beforeBreadcrumb = (breadcrumb: Breadcrumb): Breadcrumb => {
  if (!breadcrumb.category || !networkBreadcrumbCategories.has(breadcrumb.category)) {
    return breadcrumb;
  }

  const url = breadcrumb.data?.url;

  if (typeof url !== 'string') {
    return breadcrumb;
  }

  return { ...breadcrumb, data: { ...breadcrumb.data, url: stripOrigin(url) } };
};
