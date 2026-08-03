/**
 * The accessibility statement — /bg/accessibility, /en/accessibility.
 *
 * Rendered by the same shell as the privacy policy (LegalProse + PageToc +
 * legalSectionId), so anchors, the sticky index and the type all behave
 * identically. Section numerals are roman for that reason: the anchors derive
 * from them and are therefore the same in both locales.
 *
 * Shaped after the UK Design Council's statement — a commitment, what has been
 * done, how to change the text size, how to report a problem, and what sits
 * outside the council's control. Deliberately *not* a list of shortcomings:
 * a statement that catalogues its own gaps invites the reader to audit the
 * organisation rather than tell it about a barrier they hit.
 *
 * **Everything here is a factual claim about this site. Do not add one without
 * checking it, and do not leave one in place after changing the thing it
 * describes.** The measures in section III were each verified against the
 * running site on the date in section VIII — contrast by measuring every text
 * node on every page type, the rest by automated checks across sixteen pages
 * and manual review. If a claim stops being true, the honest fix is to make it
 * true again, not to soften the wording.
 */
import type { Locale } from "./home-content";
import type { LegalSection } from "./legal-content";

const CONTACT = "info@bulgariandesigncouncil.org";

const bg = {
  meta: {
    title: "Политика за достъпност — Български Дизайн Съвет",
    description:
      "Ангажиментът на Български дизайн съвет към достъпността на този сайт, " +
      "какво сме направили, за да бъде използваем от всички, и как да ни " +
      "съобщите, ако срещнете пречка.",
  },
  title: "Политика за достъпност",
  lead: "на уебсайта на Сдружение „Български дизайн съвет“",
  updated: "Последно актуализирана на 03.08.2026 г.",
  backLabel: "← Към началната страница",
  onThisPage: "На тази страница",
  sections: [
    {
      title: "I. Нашият ангажимент",
      blocks: [
        {
          p:
            "Сдружение „Български дизайн съвет“ се застъпва за дизайн, който " +
            "работи за хората. Смятаме, че това задължава първо нас: сайт, " +
            "който изключва част от читателите си, противоречи на всичко, " +
            "което защитаваме.",
        },
        {
          p:
            "Този сайт е направен така, че да бъде използваем от възможно " +
            "най-много хора — независимо дали четат с екранен четец, движат се " +
            "само с клавиатура, увеличават текста, или предпочитат намалено " +
            "движение на екрана.",
        },
      ],
    },
    {
      title: "II. Съответствие",
      blocks: [
        {
          p:
            "Сайтът е изграден по Насоките за достъпност на уеб съдържание " +
            "(WCAG) 2.2, ниво AA. Проверяваме го при всяка промяна, а не " +
            "еднократно.",
        },
        {
          p:
            "Достъпността не е изискване по закон за нас — Сдружението не е " +
            "организация от публичния сектор, така че Директива (ЕС) 2016/2102 " +
            "не се прилага. Правим го, защото е правилно, а не защото се налага.",
        },
      ],
    },
    {
      title: "III. Какво сме направили",
      blocks: [
        {
          ul: [
            "Смислен HTML с ориентири (main, nav, header, footer) на всяка страница, за да може навигацията с екранен четец да прескача между тях.",
            "Връзка „към съдържанието“ на всяка страница с навигация.",
            "Точен език на страницата (lang=\"bg\" или lang=\"en\"), така че екранните четци да произнасят текста правилно на двата езика.",
            "Едно заглавие h1 на страница и последователна йерархия на заглавията, без прескачане на нива.",
            "Контраст на текста над изискването на ниво AA навсякъде: най-ниската измерена стойност на сайта е 5,29:1 при праг 4,5:1, а най-високата — 18,3:1.",
            "Алтернативен текст на всяко изображение. Снимките в галериите се описват чрез надписите си, на български и на английски; чисто декоративните са изрично празни, за да не бъдат обявявани излишно.",
            "Пълна работа с клавиатура: панелите се затварят с Esc, фокусът се премества там, където трябва, и видимият фокус никога не се скрива под фиксираната лента.",
            "Зони за докосване от поне 44 пиксела за бутоните за затваряне.",
            "Уважаване на настройката за намалено движение: анимациите и автоматичното движение на фото каруселите спират напълно.",
            "Бутон за спиране на всяка карусел, която се движи сама.",
            "Видеата не се зареждат и не тръгват сами — показва се статичен кадър, докато не бъде натиснат.",
            "Без банер за бисквитки и без скриптове за проследяване, които да прихващат фокуса или да пречат на четенето.",
          ],
        },
      ],
    },
    {
      title: "IV. Размер на текста",
      blocks: [
        {
          p:
            "Ако текстът е твърде малък, увеличете го от браузъра си — " +
            "Ctrl и + на Windows, ⌘ и + на Mac. Сайтът се пренарежда според " +
            "ширината на екрана, от телефон до широк монитор, така че " +
            "увеличеният текст остава на една колона.",
        },
      ],
    },
    {
      title: "V. Обратната връзка е важна",
      blocks: [
        {
          p:
            "Ако срещнете пречка на този сайт, моля, кажете ни — това е " +
            "най-бързият начин да я поправим. Съобщенията за конкретен проблем " +
            "помагат най-много: коя страница, какво се опитвахте да направите и " +
            "какво използвате, за да четете сайта.",
        },
        { a: { text: CONTACT, href: `mailto:${CONTACT}` } },
        {
          p:
            "Ще потвърдим получаването в рамките на 10 работни дни и ще ви " +
            "кажем какво възнамеряваме да направим и кога.",
        },
        {
          p:
            "Ако сте се свързали с нас и не сте удовлетворени от отговора ни, " +
            "можете да подадете сигнал до Комисията за защита от дискриминация.",
        },
      ],
    },
    {
      title: "VI. Други бележки",
      blocks: [
        {
          p:
            "Част от съдържанието идва отвън и не е под наш контрол. Когато " +
            "пуснете вградено видео, то се управлява от плейъра на съответната " +
            "платформа, чиято достъпност зависи от нея. Затова видеата не " +
            "тръгват сами: страницата остава изцяло наша, докато не решите " +
            "друго.",
        },
      ],
    },
    {
      title: "VII. Технически спецификации",
      blocks: [
        {
          p:
            "Достъпността на този сайт се основава на HTML, CSS, JavaScript и " +
            "WAI-ARIA. Страниците се изобразяват предварително и основното " +
            "съдържание е четимо и без JavaScript.",
        },
      ],
    },
    {
      title: "VIII. Метод и дата на оценката",
      blocks: [
        {
          p:
            "Самооценка от екипа, който поддържа сайта: автоматични проверки на " +
            "изобразения HTML на 16 страници от всички типове в двата езика, " +
            "измерване на контраста на всеки текстов елемент на всеки тип " +
            "страница, и ръчен преглед на кода.",
        },
        { p: "Дата на оценката: 3 август 2026 г." },
      ],
    },
  ] satisfies LegalSection[],
};

const en: typeof bg = {
  meta: {
    title: "Accessibility Statement — Bulgarian Design Council",
    description:
      "The Bulgarian Design Council's commitment to the accessibility of this " +
      "site, what we have done to make it usable by everyone, and how to tell " +
      "us if you hit a barrier.",
  },
  title: "Accessibility Statement",
  lead: "for the website of the Bulgarian Design Council",
  updated: "Last updated on 3 August 2026.",
  backLabel: "← Back to home",
  onThisPage: "On this page",
  sections: [
    {
      title: "I. Our commitment",
      blocks: [
        {
          p:
            "The Bulgarian Design Council argues for design that works for " +
            "people. We think that obliges us first: a website that shuts out " +
            "some of its readers contradicts everything we advocate.",
        },
        {
          p:
            "This site is built to be usable by as many people as possible — " +
            "whether they read with a screen reader, navigate by keyboard " +
            "alone, enlarge the text, or prefer less movement on screen.",
        },
      ],
    },
    {
      title: "II. Conformance",
      blocks: [
        {
          p:
            "This site is built to the Web Content Accessibility Guidelines " +
            "(WCAG) 2.2, Level AA. We check it on every change, not once.",
        },
        {
          p:
            "Accessibility is not a legal requirement for us — the Council is " +
            "not a public sector body, so Directive (EU) 2016/2102 does not " +
            "apply. We do it because it is right, not because we have to.",
        },
      ],
    },
    {
      title: "III. What we have done",
      blocks: [
        {
          ul: [
            "Semantic HTML with landmarks (main, nav, header, footer) on every page, so screen-reader navigation can jump between them.",
            "A skip-to-content link on every page that carries navigation.",
            "An accurate page language (lang=\"bg\" or lang=\"en\") so screen readers pronounce the text correctly in both languages.",
            "One h1 per page and a consistent heading hierarchy, with no skipped levels.",
            "Text contrast above the Level AA requirement throughout: the lowest measured value on the site is 5.29:1 against a 4.5:1 threshold, and the highest is 18.3:1.",
            "Alt text on every image. Gallery photographs are described by their captions, in Bulgarian and English; purely decorative ones are explicitly empty so they are not announced needlessly.",
            "Full keyboard operation: panels close with Esc, focus moves where it should, and visible focus is never hidden under the fixed header.",
            "Touch targets of at least 44 pixels for close buttons.",
            "The reduced-motion setting is respected: animations and automatic photo-carousel movement stop entirely.",
            "A pause control on every carousel that moves by itself.",
            "Videos neither load nor start on their own — a still frame is shown until it is activated.",
            "No cookie banner and no tracking scripts to trap focus or interrupt reading.",
          ],
        },
      ],
    },
    {
      title: "IV. Text size",
      blocks: [
        {
          p:
            "If the text is too small, enlarge it in your browser — Ctrl and + " +
            "on Windows, ⌘ and + on a Mac. The site reflows to the width of " +
            "your screen, from a phone to a wide monitor, so enlarged text " +
            "stays in a single column.",
        },
      ],
    },
    {
      title: "V. Your feedback is important",
      blocks: [
        {
          p:
            "If you hit a barrier on this site, please tell us — it is the " +
            "fastest way for us to fix it. Reports about a specific problem " +
            "help most: which page, what you were trying to do, and what you " +
            "use to read the site.",
        },
        { a: { text: CONTACT, href: `mailto:${CONTACT}` } },
        {
          p:
            "We will acknowledge your message within 10 working days and tell " +
            "you what we intend to do and when.",
        },
        {
          p:
            "If you have contacted us and are not satisfied with our response, " +
            "you may raise the matter with the Commission for Protection " +
            "against Discrimination (Комисия за защита от дискриминация).",
        },
      ],
    },
    {
      title: "VI. Other points",
      blocks: [
        {
          p:
            "Some content comes from elsewhere and is not under our control. " +
            "Once you play an embedded video it is handled by that platform's " +
            "own player, whose accessibility is theirs. That is why videos do " +
            "not start on their own: the page stays entirely ours until you " +
            "decide otherwise.",
        },
      ],
    },
    {
      title: "VII. Technical specifications",
      blocks: [
        {
          p:
            "Accessibility of this site relies on HTML, CSS, JavaScript and " +
            "WAI-ARIA. Pages are prerendered, and the main content is readable " +
            "without JavaScript.",
        },
      ],
    },
    {
      title: "VIII. Assessment method and date",
      blocks: [
        {
          p:
            "Self-assessment by the team that maintains the site: automated " +
            "checks of the rendered HTML across 16 pages covering every page " +
            "type in both languages, contrast measurement of every text " +
            "element on every page type, and manual code review.",
        },
        { p: "Date of assessment: 3 August 2026." },
      ],
    },
  ] satisfies LegalSection[],
};

export type AccessibilityContent = typeof bg;

export function getAccessibilityContent(locale: Locale): AccessibilityContent {
  return locale === "en" ? en : bg;
}
