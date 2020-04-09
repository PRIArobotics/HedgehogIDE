// @flow

import { MessageFormatElement } from 'react-intl';

// eslint-disable-next-line camelcase
import messages_de from './locales/de';
// eslint-disable-next-line camelcase
import messages_en from './locales/en';

export type LocaleMap<T> = { [locale: string]: T };

type Messages =
  | { [key: string]: string }
  | { [key: string]: MessageFormatElement[] };

export const MESSAGES: LocaleMap<Messages> = {
  de: messages_de,
  en: messages_en,
};

// returns the first locale in `locales` matching the predicate. Most of the
// time, the predicate will be a simple membership test.
// The test is performed as follows:
// - first, all locales are normalized so that e.g. "de-AT" becomes "de_at"
// - second, if any of the locales matches the predicate, that is returned
// - third, the language-only variants are taken, i.e. "de_at" becomes "de"
// - if there is a match, that is returned
// - lastly, null is returned.
// For meaningful results, the `locales` array should already contain
// language-only locales as alternatives. Otherwise, an array such as
//
//     ['en-US', 'de']
//
// Will return 'de' in favor of 'en' if those are supported but 'en-US' isn't.
// Instead of valuing a language match over an exact match, a sufficiently
// detailed list of preferences is required.
export function getEffectiveLocale(
  locales: string[],
  supported: string => boolean,
): string | null {
  // normalize things like 'de-AT' to 'de_at'
  const normalized = locales.map(locale =>
    locale.toLowerCase().replace('-', '_'),
  );

  // try to find a match for any of the exact locales
  const exact = normalized.find(supported);
  if (exact) return exact;

  // try to find a match for any of the exact language-only locales
  const language = normalized
    .map(locale => locale.split('_')[0])
    .find(supported);
  if (language) return language;

  return null;
}

// chooses the best element in `map` based on the given `locales`,
// using the algorithm of `getEffectiveLocale()`.
export function getTranslation<T>(
  locales: string[],
  map: LocaleMap<T>,
): T | null {
  const locale = getEffectiveLocale(locales, Object.hasOwnProperty.bind(map));

  return locale ? map[locale] : null;
}
