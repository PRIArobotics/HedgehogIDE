// @flow

import { MessageFormatElement } from 'react-intl';

// eslint-disable-next-line camelcase
import messages_de from './locales/de';
// eslint-disable-next-line camelcase
import messages_en from './locales/en';

type Messages =
  | { [key: string]: string }
  | { [key: string]: MessageFormatElement[] };

export const messages: { [key: string]: Messages } = {
  de: messages_de,
  en: messages_en,
};

export function getTranslations(locales: string[]): Messages | void {
  // normalize things like 'de-AT' to 'de_at'
  const normalized = locales.map(locale =>
    locale.toLowerCase().replace('-', '_'),
  );

  // try to find a match for any of the exact locales
  const exact = normalized.find(locale =>
    Object.hasOwnProperty.call(messages, locale),
  );
  if (exact) return messages[exact];

  // try to find a match for any of the exact language-only locales
  const language = normalized
    .map(locale => locale.split('_')[0])
    .find(locale => Object.hasOwnProperty.call(messages, locale));
  if (language) return messages[language];

  return undefined;
}
