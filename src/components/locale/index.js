// @flow

import * as React from 'react';

import { IntlProvider } from 'react-intl';

import { getTranslations } from '../../translations';

type Locale = {|
  preferredLocale: string | null,
  setPreferredLocale: string => void | Promise<void>,
|};

export const LocaleContext = React.createContext<Locale>({
  preferredLocale: null,
  setPreferredLocale: () => {
    throw new Error('setPreferredLocale not specified');
  },
});

type PropTypes = {|
  userAgentLocales: string[],
  children: React.Node,
|};

export function LocaleProvider({ userAgentLocales, children }: PropTypes) {
  const [preferredLocale, setPreferredLocale] = React.useState(() => {
    // TODO load preferences
    return null;
  });

  React.useEffect(() => {
    // TODO store preferences
  }, [preferredLocale]);

  const activeLocales =
    preferredLocale === null
      ? userAgentLocales
      : [preferredLocale, ...userAgentLocales];

  return (
    <LocaleContext.Provider value={{ preferredLocale, setPreferredLocale }}>
      <IntlProvider
        locale={activeLocales.length >= 1 ? activeLocales[0] : null}
        messages={getTranslations(activeLocales)}
      >
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}
