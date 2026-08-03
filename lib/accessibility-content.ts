/**
 * The accessibility statement — /bg/accessibility, /en/accessibility.
 *
 * Structured to the W3C's model statement and EN 301 549, and rendered by the
 * same shell as the privacy policy (LegalProse + PageToc + legalSectionId), so
 * anchors, the sticky index and the type all behave identically. Section
 * numerals are roman for that reason: the anchors are derived from them and are
 * therefore identical in both locales.
 *
 * BDC is a сдружение, not a public sector body, so the EU Web Accessibility
 * Directive (2016/2102) does not bind it, and the European Accessibility Act
 * covers services this site does not provide. This document is voluntary. That
 * is precisely why it must be accurate: nobody requires it, so its only value
 * is that every claim in it can be checked.
 *
 * **Everything here is a factual claim about the site. Do not edit one without
 * re-checking it.** The measures in section III were each verified against the
 * running site on the date in section VIII, and the limitations in section IV
 * are the things that verification could not establish. Adding a measure that
 * "should" be true, or dropping a limitation that is still true, turns the one
 * document on the site whose whole purpose is honesty into the opposite.
 */
import type { Locale } from "./home-content";
import type { LegalSection } from "./legal-content";

const CONTACT = "info@bulgariandesigncouncil.org";

const bg = {
  meta: {
    title: "Политика за достъпност — Български Дизайн Съвет",
    description:
      "Ангажиментът на Български дизайн съвет към достъпността на този сайт, " +
      "статусът на съответствие с WCAG 2.2 ниво AA, известните ограничения и " +
      "как да съобщите за проблем.",
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
            "Сдружение „Български дизайн съвет“ се застъпва за дизайн, който работи " +
            "за хората. Смятаме, че това задължава първо нас: сайт, който изключва " +
            "част от читателите си, противоречи на всичко, което защитаваме.",
        },
        {
          p:
            "Стремим се този сайт да бъде използваем от възможно най-много хора, " +
            "независимо дали четат с екранен четец, движат се само с клавиатура, " +
            "увеличават текста, или предпочитат намалено движение на екрана.",
        },
        {
          p:
            "Този документ не се изисква по закон. Сдружението не е организация от " +
            "публичния сектор, така че Директива (ЕС) 2016/2102 не се прилага за " +
            "него. Публикуваме го доброволно — и точно затова всяко твърдение в " +
            "него е проверено, включително онези, които не са в наша полза.",
        },
      ],
    },
    {
      title: "II. Статус на съответствие",
      blocks: [
        {
          p:
            "Този сайт съответства частично на Насоките за достъпност на уеб " +
            "съдържание (WCAG) 2.2, ниво AA. „Частично“ означава, че по-голямата " +
            "част от изискванията са изпълнени, но не всички са проверени в " +
            "необходимата дълбочина. Разделът с известните ограничения по-долу " +
            "казва точно кои.",
        },
        {
          p:
            "Не твърдим пълно съответствие. Пълно съответствие изисква независим " +
            "одит, какъвто към тази дата не е правен.",
        },
      ],
    },
    {
      title: "III. Какво сме направили",
      blocks: [
        { p: "Всяка от следните мерки е проверена на живо на датата в раздел VIII:" },
        {
          ul: [
            "Смислен HTML с ориентири (main, nav, header, footer) на всяка страница.",
            "Връзка „към съдържанието“ на всяка страница, която има навигация.",
            "Точен език на страницата (lang=\"bg\" или lang=\"en\"), така че екранните четци да произнасят текста правилно.",
            "Едно заглавие h1 на страница и без прескачане на нива в йерархията на заглавията.",
            "Алтернативен текст на всяко изображение; декоративните са изрично празни, за да не бъдат обявявани излишно.",
            "Пълна работа с клавиатура: overlay панелите се затварят с Esc, фокусът се премества върху бутона за затваряне при отваряне и видимият фокус никога не се скрива под фиксираната лента.",
            "Зони за докосване от поне 44 пиксела за бутоните за затваряне (WCAG 2.5.5).",
            "Уважаване на prefers-reduced-motion: анимациите на overlay панелите и автоматичното движение на фото каруселите спират напълно.",
            "Бутон за спиране на фото каруселите, които се движат автоматично (WCAG 2.2.2).",
            "Контраст на текста във футъра между 5,3:1 и 18,3:1 — над прага от 4,5:1.",
            "Видеата не се зареждат и не тръгват сами: показва се статичен кадър, докато не бъде натиснат.",
            "Без банер за бисквитки и без скриптове на трети страни, които да прихващат фокуса.",
          ],
        },
      ],
    },
    {
      title: "IV. Известни ограничения",
      blocks: [
        {
          p:
            "Това са нещата, които знаем, че не сме доказали. Изброяваме ги, защото " +
            "изявление за достъпност без такъв раздел обикновено означава, че никой " +
            "не е гледал достатъчно внимателно.",
        },
        {
          ul: [
            "Сайтът не е тестван с реални екранни четци (NVDA, JAWS, VoiceOver). Оценката е самооценка чрез автоматични проверки и преглед на кода, което не е същото като да чуеш страницата.",
            "Контрастът на цветовете е измерен във футъра и основния текст, но не систематично във всички компоненти и състояния — например при задържане на курсора и при фокус.",
            "Във фото каруселите само първата снимка носи описателен алтернативен текст; останалите са маркирани като декоративни.",
            "Съдържанието на събитията идва от Notion и се редактира от хора; качеството на алтернативните текстове там зависи от редактора.",
            "След като бъде пуснато, вграденото видео от YouTube се управлява от плейъра на YouTube, чиято достъпност не е под наш контрол.",
            "Не е правен независим одит от трета страна.",
          ],
        },
        {
          p:
            "Работим по тези точки. Тестването с екранни четци и систематичната " +
            "проверка на контраста са следващите, които ще адресираме.",
        },
      ],
    },
    {
      title: "V. Обратна връзка",
      blocks: [
        {
          p:
            "Ако срещнете пречка на този сайт, моля, кажете ни. Съобщенията за " +
            "конкретен проблем са най-полезни: коя страница, какво се опитвахте да " +
            "направите и какво използвате, за да четете сайта.",
        },
        { a: { text: CONTACT, href: `mailto:${CONTACT}` } },
        {
          p:
            "Ще потвърдим получаването в рамките на 10 работни дни и ще ви кажем " +
            "какво възнамеряваме да направим и кога.",
        },
      ],
    },
    {
      title: "VI. Ако не сме отговорили адекватно",
      blocks: [
        {
          p:
            "Ако сте се свързали с нас и не сте удовлетворени от отговора ни, " +
            "можете да подадете сигнал до Комисията за защита от дискриминация.",
        },
      ],
    },
    {
      title: "VII. Технически спецификации",
      blocks: [
        {
          p:
            "Достъпността на този сайт се основава на HTML, CSS, JavaScript и WAI-ARIA. " +
            "Страниците се изобразяват предварително и основното съдържание е четимо " +
            "и без JavaScript.",
        },
      ],
    },
    {
      title: "VIII. Метод и дата на оценката",
      blocks: [
        {
          p:
            "Самооценка, извършена от екипа, който поддържа сайта, чрез автоматични " +
            "проверки на изобразения HTML на 14 страници от всички типове в двата " +
            "езика, изчисление на контраста и ръчен преглед на кода.",
        },
        { p: "Дата на оценката: 3 август 2026 г." },
        { p: "Това изявление е изготвено на 3 август 2026 г." },
      ],
    },
  ] satisfies LegalSection[],
};

const en: typeof bg = {
  meta: {
    title: "Accessibility Statement — Bulgarian Design Council",
    description:
      "The Bulgarian Design Council's commitment to the accessibility of this " +
      "site, its WCAG 2.2 Level AA conformance status, known limitations, and " +
      "how to report a problem.",
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
            "The Bulgarian Design Council argues for design that works for people. " +
            "We think that obliges us first: a website that shuts out some of its " +
            "readers contradicts everything we advocate.",
        },
        {
          p:
            "We aim for this site to be usable by as many people as possible — " +
            "whether they read with a screen reader, navigate by keyboard alone, " +
            "enlarge the text, or prefer less movement on screen.",
        },
        {
          p:
            "This document is not required by law. The Council is not a public " +
            "sector body, so Directive (EU) 2016/2102 does not apply to it. We " +
            "publish it voluntarily — which is exactly why every claim in it has " +
            "been checked, including the ones that do not flatter us.",
        },
      ],
    },
    {
      title: "II. Conformance status",
      blocks: [
        {
          p:
            "This site is partially conformant with the Web Content Accessibility " +
            "Guidelines (WCAG) 2.2, Level AA. \"Partially\" means most requirements " +
            "are met but not all have been verified to the necessary depth. The " +
            "known limitations below say exactly which.",
        },
        {
          p:
            "We do not claim full conformance. Full conformance requires an " +
            "independent audit, and none has been carried out to date.",
        },
      ],
    },
    {
      title: "III. What we have done",
      blocks: [
        { p: "Each of the following was verified against the live site on the date in section VIII:" },
        {
          ul: [
            "Semantic HTML with landmarks (main, nav, header, footer) on every page.",
            "A skip-to-content link on every page that carries navigation.",
            "An accurate page language (lang=\"bg\" or lang=\"en\") so screen readers pronounce the text correctly.",
            "One h1 per page, and no skipped levels in the heading hierarchy.",
            "Alt text on every image; decorative ones are explicitly empty so they are not announced needlessly.",
            "Full keyboard operation: overlay panels close with Esc, focus moves to the close button on open, and visible focus is never hidden under the fixed header.",
            "Touch targets of at least 44 pixels for close buttons (WCAG 2.5.5).",
            "prefers-reduced-motion respected: overlay animations and automatic photo-carousel movement stop entirely.",
            "A pause control on photo carousels that move automatically (WCAG 2.2.2).",
            "Footer text contrast between 5.3:1 and 18.3:1, above the 4.5:1 threshold.",
            "Videos neither load nor start on their own: a still frame is shown until it is activated.",
            "No cookie banner and no third-party scripts that could trap focus.",
          ],
        },
      ],
    },
    {
      title: "IV. Known limitations",
      blocks: [
        {
          p:
            "These are the things we know we have not proved. We list them because " +
            "an accessibility statement without such a section usually means nobody " +
            "looked closely enough.",
        },
        {
          ul: [
            "The site has not been tested with real screen readers (NVDA, JAWS, VoiceOver). The assessment is a self-assessment using automated checks and code review, which is not the same as hearing the page.",
            "Colour contrast has been measured in the footer and body text, but not systematically across every component and state — hover and focus in particular.",
            "In photo carousels only the first photograph carries descriptive alt text; the rest are marked decorative.",
            "Event content comes from Notion and is edited by people; the quality of alt text there depends on the editor.",
            "Once started, embedded YouTube video is controlled by YouTube's own player, whose accessibility is not under our control.",
            "No independent third-party audit has been carried out.",
          ],
        },
        {
          p:
            "We are working on these. Screen-reader testing and a systematic " +
            "contrast check are the next we will address.",
        },
      ],
    },
    {
      title: "V. Feedback",
      blocks: [
        {
          p:
            "If you hit a barrier on this site, please tell us. Reports about a " +
            "specific problem help most: which page, what you were trying to do, " +
            "and what you use to read the site.",
        },
        { a: { text: CONTACT, href: `mailto:${CONTACT}` } },
        {
          p:
            "We will acknowledge your message within 10 working days and tell you " +
            "what we intend to do and when.",
        },
      ],
    },
    {
      title: "VI. If we have not responded adequately",
      blocks: [
        {
          p:
            "If you have contacted us and are not satisfied with our response, you " +
            "may raise the matter with the Commission for Protection against " +
            "Discrimination (Комисия за защита от дискриминация).",
        },
      ],
    },
    {
      title: "VII. Technical specifications",
      blocks: [
        {
          p:
            "Accessibility of this site relies on HTML, CSS, JavaScript and WAI-ARIA. " +
            "Pages are prerendered, and the main content is readable without " +
            "JavaScript.",
        },
      ],
    },
    {
      title: "VIII. Assessment method and date",
      blocks: [
        {
          p:
            "Self-assessment by the team that maintains the site, using automated " +
            "checks of the rendered HTML across 14 pages covering every page type " +
            "in both languages, contrast calculation, and manual code review.",
        },
        { p: "Date of assessment: 3 August 2026." },
        { p: "This statement was prepared on 3 August 2026." },
      ],
    },
  ] satisfies LegalSection[],
};

export type AccessibilityContent = typeof bg;

export function getAccessibilityContent(locale: Locale): AccessibilityContent {
  return locale === "en" ? en : bg;
}
