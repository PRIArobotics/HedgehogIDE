import messages_de from './locales/de';

export const messages = {
  de: messages_de,
};

export function getTranslations(locale) {
  // normalize things like 'de-AT' to 'de_at'
  const normalized = locale.toLowerCase().replace('-', '_');
  if (Object.hasOwnProperty.call(messages, normalized)) return messages[normalized];

  // language-only locale, e.g. 'de'
  const language = normalized.split('_')[0];
  if (Object.hasOwnProperty.call(messages, language)) return messages[language];

  return undefined;
}