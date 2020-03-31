import manageTranslations from 'react-intl-translations-manager';

// eslint-disable-next-line camelcase
export default async function codegen_i18n() {
  manageTranslations({
    messagesDirectory: 'src/translations/extractedMessages',
    translationsDirectory: 'src/translations/locales/',
    languages: ['de'],
  });
}
