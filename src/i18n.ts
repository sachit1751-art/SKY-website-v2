import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          home: 'Home',
          deviceSpecs: 'SKY Device & Specs',
          roms: 'AOSP ROMs',
          team: 'Team & Maintainers',
          community: 'Community & About',
        }
      },
      hi: {
        translation: {
          home: 'होम',
          deviceSpecs: 'SKY डिवाइस और विनिर्देश',
          roms: 'AOSP ROMs',
          team: 'टीम और रखरखावकर्ता',
          community: 'समुदाय और बारे में',
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
