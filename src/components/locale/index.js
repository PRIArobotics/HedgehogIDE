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
  const [preferredLocale, setPreferredLocale] = React.useState<string | null>(
    () => {
      if (!process.env.BROWSER) return null;
      return localStorage.getItem('preferred-locale') || null;
    },
  );

  React.useEffect(() => {
    if (!process.env.BROWSER) return;

    if (preferredLocale !== null) {
      localStorage.setItem('preferred-locale', preferredLocale);
    } else {
      localStorage.removeItem('preferred-locale');
    }
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

export function useLocale(): Locale {
  return React.useContext(LocaleContext);
}
