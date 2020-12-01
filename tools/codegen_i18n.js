import manageTranslations from 'react-intl-translations-manager';

// eslint-disable-next-line camelcase
export default async function codegen_i18n() {
  manageTranslations({
    messagesDirectory: 'src/translations/extractedMessages',
    translationsDirectory: 'src/translations/locales/',
    languages: process.argv.includes('--check')
      ? // don't put default language of 'en' when checking
        ['de', 'sk']
      : // do put default language of 'en' when generating
        ['en', 'de', 'sk'],
  });
}
