// @flow

import * as React from 'react';

import { IntlProvider } from 'react-intl';

import { getTranslations } from '../../translations';

type PropTypes = {|
  userAgentLocales: string[],
  children: React.Node,
|};

export function LocaleProvider({ userAgentLocales, children }: PropTypes) {
  return (
    <IntlProvider
      locale={userAgentLocales.length >= 1 ? userAgentLocales[0] : null}
      messages={getTranslations(userAgentLocales)}
    >
      {children}
    </IntlProvider>
  );
}
