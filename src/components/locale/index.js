// @flow

import * as React from 'react';

import { IntlProvider } from 'react-intl';

import { type LocaleMap, MESSAGES, getTranslation } from '../../translations';

type Locale = {|
  // the preferred locale stored in the Hedgehog IDE
  preferredLocale: string | null,
  // all preferred locales: the one explicitly set by the user if not null,
  // followed by the ones from the environment, e.g. user agent information
  preferredLocales: string[],
  setPreferredLocale: string => void | Promise<void>,
|};

export const LocaleContext = React.createContext<Locale>({
  preferredLocale: null,
  preferredLocales: [],
  setPreferredLocale: () => {
    throw new Error('setPreferredLocale not specified');
  },
});

type LocaleProviderPropTypes = {|
  userAgentLocales: string[],
  children: React.Node,
|};

export function LocaleProvider({
  userAgentLocales,
  children,
}: LocaleProviderPropTypes) {
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

  const preferredLocales = [
    ...(preferredLocale === null ? [] : [preferredLocale]),
    ...userAgentLocales,
  ];

  const locale = preferredLocales[0] || 'en';
  const messages = getTranslation(preferredLocales, MESSAGES) || MESSAGES.en;

  return (
    <LocaleContext.Provider
      value={{ preferredLocale, preferredLocales, setPreferredLocale }}
    >
      <IntlProvider locale={locale} messages={messages}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return React.useContext(LocaleContext);
}

type LocaleConsumerPropTypes = {|
  children: Locale => React.Node,
|};

export function LocaleConsumer({ children }: LocaleConsumerPropTypes) {
  const locale = useLocale();

  return children(locale);
}

type LocaleSelectorPropTypes<T> = {|
  components: LocaleMap<React.ComponentType<T>>,
  ...T,
|};

export function LocaleSelector<T>({
  components,
  ...props
}: LocaleSelectorPropTypes<T>) {
  const { preferredLocales } = useLocale();
  const Component =
    getTranslation(preferredLocales, components) || components.en;

  return <Component {...props} />;
}
