import { createContext, useContext, useState, useEffect } from 'react';

// Centralised Dictionary
const translations = {
  en: {
    dashboard: 'Dashboard',
    products: 'Products',
    newBill: 'New Bill',
    udhari: 'Udhari',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',
    // Settings
    profileInfo: 'Profile Information',
    preferences: 'Preferences',
    language: 'Language',
    theme: 'Theme',
    shopName: 'Shop Name',
    ownerName: 'Owner Name',
    phone: 'Phone Number',
    saveChanges: 'Save Changes',
    light: 'Light',
    dark: 'Dark',
    // App Specific
    searchItem: 'Search item to add (Name or SKU)',
    totalSold: 'Total Sold',
    revenue: 'Revenue',
    todaySales: 'Today Sales',
    todayProfit: 'Today Profit',
    lowStock: 'Low Stock Alerts',
    marketUdhari: 'Market Udhari'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    products: 'सामान (Products)',
    newBill: 'बिल बनाओ (Billing)',
    udhari: 'उधारी (Ledger)',
    reports: 'रिपोर्ट (Reports)',
    settings: 'सेटिंग (Settings)',
    logout: 'लॉगआउट',
    profileInfo: 'प्रोफाइल जानकारी',
    preferences: 'पसंद (Preferences)',
    language: 'भाषा (Language)',
    theme: 'थीम (Theme)',
    shopName: 'दुकान का नाम',
    ownerName: 'मालिक का नाम',
    phone: 'फ़ोन नंबर',
    saveChanges: 'बदलाव सेव करें',
    light: 'लाइट',
    dark: 'डार्क',
    searchItem: 'सामान खोजें (नाम या SKU)',
    totalSold: 'कुल बिक्री',
    revenue: 'कुल कमाई',
    todaySales: 'आज की बिक्री',
    todayProfit: 'आज का मुनाफा',
    lowStock: 'कम स्टॉक',
    marketUdhari: 'बाजार में उधारी'
  },
  mr: {
    dashboard: 'डॅशबोर्ड',
    products: 'उत्पादने (Products)',
    newBill: 'नवीन बिल (Billing)',
    udhari: 'उधारी (Ledger)',
    reports: 'अहवाल (Reports)',
    settings: 'सेटिंग्ज (Settings)',
    logout: 'बाहेर पडा',
    profileInfo: 'प्रोफाइल माहिती',
    preferences: 'पसंती (Preferences)',
    language: 'भाषा (Language)',
    theme: 'थीम (Theme)',
    shopName: 'दुकानाचे नाव',
    ownerName: 'मालकाचे नाव',
    phone: 'फोन नंबर',
    saveChanges: 'बदल जतन करा',
    light: 'प्रकाश',
    dark: 'अंधार',
    searchItem: 'आयटम शोधा (नाव किंवा SKU)',
    totalSold: 'एकूण विक्री',
    revenue: 'महसूल',
    todaySales: 'आजची विक्री',
    todayProfit: 'आजचा नफा',
    lowStock: 'कमी स्टॉक',
    marketUdhari: 'बाजार उधारी'
  },
  gu: {
    dashboard: 'ડેશબોર્ડ',
    products: 'ઉત્પાદનો (Products)',
    newBill: 'નવું બિલ (Billing)',
    udhari: 'ઉધારી (Ledger)',
    reports: 'અહેવાલો (Reports)',
    settings: 'સેટિંગ્સ (Settings)',
    logout: 'લૉગઆઉટ',
    profileInfo: 'પ્રોફાઇલ માહિતી',
    preferences: 'પસંદગીઓ (Preferences)',
    language: 'ભાષા (Language)',
    theme: 'થીમ (Theme)',
    shopName: 'દુકાનનું નામ',
    ownerName: 'માલિકનું નામ',
    phone: 'ફોન નંબર',
    saveChanges: 'ફેરફારો સાચવો',
    light: 'આછું',
    dark: 'ઘાટું',
    searchItem: 'આઇટમ શોધો (નામ અથવા SKU)',
    totalSold: 'કુલ વેચાણ',
    revenue: 'આવક',
    todaySales: 'આજનું વેચાણ',
    todayProfit: 'આજનો નફો',
    lowStock: 'ઓછો સ્ટોક',
    marketUdhari: 'બજારની ઉધારી'
  }
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('kiranaLang') || 'en');

  useEffect(() => {
    localStorage.setItem('kiranaLang', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: ['en', 'hi', 'mr', 'gu'] }}>
      {children}
    </LanguageContext.Provider>
  );
};
