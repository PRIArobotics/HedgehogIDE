// @flow

import * as React from 'react';

import { IntlProvider } from 'react-intl';

import { type LocaleMap, MESSAGES, getTranslation } from '../../translations';

type Locale = {|
  // the preferred locale stored in the Hedgehog IDE
  preferredLocale: string | null,
  setPreferredLocale: (string | null) => void | Promise<void>,
  // all preferred locales: the one explicitly set by the user if not null,
  // followed by the ones from the environment, e.g. user agent information
  preferredLocales: string[],
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

/**
 * `LocaleProvider` takes an array of locales that the user agent indicates are
 * preferred by the user, and adds the option for the user to specify their own
 * preference.
 *
 * Code manipulating the explicitly given preference should use
 * `preferredLocale` and `setPreferredLocale`; code trying to find the best
 * supported locale should use `preferredLocales`, which prepends the stored
 * preference (if any) to the user agent locales, and choose the first
 * supported locale from that list.
 *
 * Other than providing the preferences, `LocaleProvider` also instantiates a
 * `IntlProvider` with an appropriate locale, so the `children` can use all of
 * the `react-intl` facilities. The locale, used e.g. for date and number
 * formatting, is chosen as `preferredLocales[0] ?? en`; the translation
 * messages are chosen using `getTranslations`, with `en` as the fallback
 * message key.
 */
export function LocaleProvider({ userAgentLocales, children }: LocaleProviderPropTypes) {
  const [preferredLocale, setPreferredLocale] = React.useState<string | null>(() => {
    if (!process.env.BROWSER) return null;
    return localStorage.getItem('preferred-locale') ?? null;
  });

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

  const locale = preferredLocales[0] ?? 'en';
  const messages = getTranslation(preferredLocales, MESSAGES) ?? MESSAGES.en;

  return (
    <LocaleContext.Provider value={{ preferredLocale, preferredLocales, setPreferredLocale }}>
      <IntlProvider locale={locale} messages={messages}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

/**
 * React hook for accessing the locale context.
 */
export function useLocale(): Locale {
  return React.useContext(LocaleContext);
}

type LocaleConsumerPropTypes = {|
  children: (Locale) => React.Node,
|};

/**
 * Component for accessing the locale context from class components.
 */
export function LocaleConsumer({ children }: LocaleConsumerPropTypes) {
  const locale = useLocale();

  return children(locale);
}

type LocaleSelectorPropTypes<T> = {|
  components: LocaleMap<React.ComponentType<T>>,
  ...T,
|};

/**
 * Component for using a different component based on the locale. The
 * `components` prop is a map from locale strings to component types.
 * One component is chosen using `getTranslation`, with `en` as the fallback
 * key.
 */
export function LocaleSelector<T>({ components, ...props }: LocaleSelectorPropTypes<T>) {
  const { preferredLocales } = useLocale();
  const Component = getTranslation(preferredLocales, components) ?? components.en;

  return <Component {...props} />;
}
