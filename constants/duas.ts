export interface Dua {
  id: string;
  category: "ihram" | "tawaf" | "sai" | "general";
  arabic: string;
  transliteration: string;
  translation: {
    en: string;
    ar: string;
    ta: string;
    ur: string;
  };
}

export const duasData: Dua[] = [
  {
    id: "ihram1",
    category: "ihram",
    arabic:
      "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ",
    transliteration:
      "Labbayka Allāhumma labbayk, labbayka lā sharīka laka labbayk, inna al-ḥamda wa-n-niʿmata laka wa-l-mulk, lā sharīka lak",
    translation: {
      en: "Here I am at Your service, O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise and blessings are Yours, and all sovereignty. You have no partner.",
      ar: "لبيك اللهم لبيك، لبيك لا شريك لك لبيك، إن الحمد والنعمة لك والملك، لا شريك لك",
      ta: "இதோ நான் உங்கள் சேவையில், அல்லாஹ், இதோ நான். இதோ நான், உங்களுக்கு துணை இல்லை, இதோ நான். உண்மையில் அனைத்து புகழும் ஆசீர்வாதங்களும் உங்களுடையவை, மற்றும் அனைத்து இறையாண்மையும். உங்களுக்கு துணை இல்லை.",
      ur: "میں حاضر ہوں اے اللہ، میں حاضر ہوں۔ میں حاضر ہوں، تیرا کوئی شریک نہیں، میں حاضر ہوں۔ بیشک تمام تعریفیں اور نعمتیں تیری ہیں، اور تمام بادشاہت۔ تیرا کوئی شریک نہیں۔",
    },
  },
  {
    id: "tawaf1",
    category: "tawaf",
    arabic:
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration:
      "Rabbanā ātinā fī-d-dunyā ḥasanatan wa fī-l-ākhirati ḥasanatan wa qinā ʿadhāba-n-nār",
    translation: {
      en: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
      ar: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
      ta: "எங்கள் இறைவா, இவ்வுலகில் எங்களுக்கு நன்மை தருவாயாக, மறுமையிலும் நன்மை தருவாயாக, மேலும் நரக வேதனையிலிருந்து எங்களைப் பாதுகாப்பாயாக.",
      ur: "اے ہمارے رب، ہمیں دنیا میں بھلائی دے اور آخرت میں بھی بھلائی دے، اور ہمیں آگ کے عذاب سے بچا۔",
    },
  },
  {
    id: "sai1",
    category: "sai",
    arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ",
    transliteration: "Inna-ṣ-Ṣafā wa-l-Marwata min shaʿāʾiri-llāh",
    translation: {
      en: "Indeed, As-Safa and Al-Marwah are among the symbols of Allah.",
      ar: "إن الصفا والمروة من شعائر الله",
      ta: "நிச்சயமாக, அஸ்-ஸஃபா மற்றும் அல்-மர்வா அல்லாஹ்வின் அடையாளங்களில் ஒன்றாகும்.",
      ur: "بیشک صفا اور مروہ اللہ کی نشانیوں میں سے ہیں۔",
    },
  },
  {
    id: "general1",
    category: "general",
    arabic:
      "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
    transliteration:
      "Subḥāna-llāhi wa-l-ḥamdu lillāhi wa lā ilāha illa-llāhu wa-llāhu akbar",
    translation: {
      en: "Glory be to Allah, and all praise is for Allah, and there is no deity except Allah, and Allah is the Greatest.",
      ar: "سبحان الله والحمد لله ولا إله إلا الله والله أكبر",
      ta: "அல்லாஹ்வுக்கு மகிமை உண்டு, அனைத்து புகழும் அல்லாஹ்வுக்கே, அல்லாஹ்வைத் தவிர வேறு இறைவன் இல்லை, அல்லாஹ் மிகப் பெரியவன்.",
      ur: "اللہ پاک ہے، اور تمام تعریفیں اللہ کے لیے ہیں، اور اللہ کے سوا کوئی معبود نہیں، اور اللہ سب سے بڑا ہے۔",
    },
  },
];
