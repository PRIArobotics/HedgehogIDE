// @flow

import { MessageFormatElement } from 'react-intl';

// eslint-disable-next-line camelcase
import messages_de from './locales/de';

type Messages =
  | { [key: string]: string }
  | { [key: string]: MessageFormatElement[] };

export const messages: { [key: string]: Messages } = {
  de: messages_de,
};

export function getTranslations(locale: string): Messages | void {
  // normalize things like 'de-AT' to 'de_at'
  const normalized = locale.toLowerCase().replace('-', '_');
  if (Object.hasOwnProperty.call(messages, normalized))
    return messages[normalized];

  // language-only locale, e.g. 'de'
  const language = normalized.split('_')[0];
  if (Object.hasOwnProperty.call(messages, language)) return messages[language];

  return undefined;
}
