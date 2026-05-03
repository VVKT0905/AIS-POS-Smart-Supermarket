import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
      title={i18n.language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
    >
      <Languages className="w-4 h-4" />
      <span className="uppercase">{i18n.language}</span>
    </button>
  );
}
