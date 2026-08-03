/**
 * The accessibility statement — /bg/accessibility, /en/accessibility.
 *
 * Rendered by the same shell as the privacy policy (LegalProse + PageToc +
 * legalSectionId), so anchors, the sticky index and the type all behave
 * identically. Section numerals are roman for that reason: the anchors derive
 * from them and are therefore the same in both locales.
 *
 * The Bulgarian is the council's own copy and is authoritative; the English is
 * a translation of it. When they diverge, the Bulgarian is right.
 *
 * **Everything here is a factual claim about this site.** Section III in
 * particular reads as a list of things that are true right now. Two of them
 * depend on content rather than code — the alt text on informative images and
 * the gallery descriptions come from captions editors write in Notion, so they
 * are true to the extent those captions exist. If a claim stops being true,
 * the honest fix is to make it true again, not to soften the wording.
 */
import type { Locale } from "./home-content";
import type { LegalSection } from "./legal-content";

const CONTACT = "info@bulgariandesigncouncil.org";

/**
 * The closing line, repeated at the foot of the last section in both locales.
 * It is the one sentence that frames everything above as ongoing rather than
 * finished, which is the difference between a statement and a certificate.
 */
const CLOSING_BG =
  "Продължаваме да проверяваме сайта при значими промени и да подобряваме " +
  "процеса си чрез обратна връзка от хората, които го използват.";
const CLOSING_EN =
  "We continue to review the site whenever something significant changes, and " +
  "to improve how we do it through feedback from the people who use it.";

const bg = {
  meta: {
    title: "Политика за достъпност — Български Дизайн Съвет",
    description:
      "Ангажиментът на Български дизайн съвет към достъпността на този сайт, " +
      "стандартът, по който работим, какво сме направили и как да ни " +
      "съобщите, ако нещо ви спира.",
  },
  title: "Политика за достъпност",
  lead: "на уебсайта на Сдружение „Български дизайн съвет“",
  updated: "Последно актуализирана на 03.08.2026 г.",
  backLabel: "← Към началната страница",
  onThisPage: "На тази страница",
  sections: [
    {
      title: "I. Нашето обещание",
      blocks: [
        { p: "Достъпността е условие за равноправно участие." },
        {
          p:
            "Сдружение „Български дизайн съвет“ защитава дизайн, който служи на " +
            "хората. Затова започваме от собствената си дигитална среда. Сайт, " +
            "който изключва част от хората, противоречи на принципите, които " +
            "отстояваме.",
        },
        {
          p:
            "Проектираме и развиваме този сайт така, че възможно най-много хора " +
            "да могат да намират информация, да разбират съдържанието и да " +
            "участват пълноценно. Това включва хора, които:",
        },
        {
          ul: [
            "използват екранен четец или друга помощна технология;",
            "навигират само с клавиатура;",
            "увеличават текста или използват малък екран;",
            "имат различно цветоусещане или чувствителност към контраста;",
            "предпочитат намалено движение;",
            "имат временни, ситуационни или трайни затруднения.",
          ],
        },
        {
          p:
            "За нас достъпността не е еднократна проверка. Тя е постоянна " +
            "отговорност да слушаме, да откриваме пречките и да ги премахваме.",
        },
      ],
    },
    {
      title: "II. Стандарт и текущо състояние",
      blocks: [
        {
          p:
            "Проектирахме и разработихме сайта с цел съответствие с Насоките за " +
            "достъпност на уеб съдържание WCAG 2.2, ниво AA.",
        },
        {
          p:
            "Към датата на последната самооценка не установихме известни " +
            "несъответствия в проверените страници и компоненти. Това твърдение " +
            "се основава на вътрешно автоматизирано и ръчно тестване. То не " +
            "представлява независима сертификация и не заменя проверките с " +
            "хора, които използват различни помощни технологии.",
        },
        {
          p:
            "WCAG определя съответствието на ниво цяла страница, включително " +
            "различните ѝ responsive варианти, а не само на отделни компоненти. " +
            "Затова преглеждаме достъпността при значими промени по дизайна, " +
            "съдържанието или функционалността.",
        },
      ],
    },
    {
      title: "III. Какво сме направили",
      blocks: [
        { h: "Структура и разбираемост" },
        {
          ul: [
            "Използваме смислен HTML и ясно обозначени области като header, nav, main и footer.",
            "Всяка страница има едно основно заглавие и последователна йерархия без прескачане на нива.",
            "Посочваме правилния език на страницата чрез lang=\"bg\" или lang=\"en\", за да подпомогнем правилното произнасяне от екранните четци.",
            "Добавяме връзка „Към основното съдържание“, която позволява пропускане на повтарящата се навигация.",
            "Пишем ясни заглавия, описателни връзки и разбираеми текстове на бутоните.",
          ],
        },
        { h: "Изображения и медийно съдържание" },
        {
          ul: [
            "Информативните изображения имат смислен алтернативен текст на български и английски.",
            "Галериите използват описания, които предават значението и контекста на снимките.",
            "Декоративните изображения са скрити от помощните технологии, за да не създават излишен шум.",
            "Видеата не се зареждат и не започват автоматично. Показваме статичен кадър, докато посетителят не избере да ги стартира.",
          ],
        },
        { h: "Клавиатура и фокус" },
        {
          ul: [
            "Основните функции на сайта могат да се използват с клавиатура.",
            "Интерактивните елементи имат видим фокус.",
            "Панели и диалогови прозорци могат да се затварят с клавиша Esc.",
            "При отваряне и затваряне на интерактивни елементи фокусът се премества на логично място.",
            "Фиксираната навигация не скрива фокусирания елемент.",
            "Бутоните за затваряне имат зона за активиране от поне 44 на 44 CSS пиксела.",
          ],
        },
        {
          p:
            "Размерът 44 на 44 пиксела надхвърля минималното изискване от 24 на " +
            "24 CSS пиксела за WCAG 2.2 AA и следва по-високия критерий за " +
            "подобрена използваемост.",
        },
        { h: "Контраст, мащабиране и движение" },
        {
          ul: [
            "Всички проверени текстови комбинации покриват изискванията за контраст на ниво AA.",
            "Най-ниското измерено контрастно съотношение на проверените страници е 5,29:1 при минимален праг 4,5:1 за стандартен текст.",
            "Сайтът се адаптира към различни размери на екрана и увеличение на текста.",
            "Уважаваме системната настройка prefers-reduced-motion.",
            "Когато посетителят е избрал намалено движение, анимациите и автоматичното движение на каруселите спират.",
            "Всеки автоматично движещ се карусел има видим контрол за спиране.",
          ],
        },
        { h: "Поверителност и непрекъснат достъп" },
        {
          p:
            "Към момента сайтът не използва аналитични или рекламни скриптове за " +
            "проследяване и не зарежда ненужен банер за съгласие, който да " +
            "прихваща фокуса или да блокира съдържанието.",
        },
        {
          p:
            "Ако в бъдеще въведем незадължителни бисквитки или външни " +
            "инструменти, ще ги оценим и от гледна точка на достъпността, преди " +
            "да ги активираме.",
        },
      ],
    },
    {
      title: "IV. Увеличаване на текста",
      blocks: [
        { p: "Можете да увеличите текста чрез настройките на браузъра:" },
        {
          ul: [
            "в Windows и Linux: Ctrl и +;",
            "в macOS: ⌘ и +;",
            "за връщане към стандартния размер: Ctrl или ⌘ и 0.",
          ],
        },
        {
          p:
            "Сайтът се пренарежда според ширината на екрана, така че " +
            "съдържанието да остане четимо на телефон, таблет и широк монитор.",
        },
      ],
    },
    {
      title: "V. Кажете ни, когато нещо ви спира",
      blocks: [
        {
          p:
            "Автоматичните проверки не могат да открият всяка пречка. " +
            "Най-важната проверка е реалното използване на сайта.",
        },
        { p: "Ако срещнете затруднение, пишете ни на:" },
        { a: { text: CONTACT, href: `mailto:${CONTACT}` } },
        {
          p:
            "Ще ни помогнете да разберем и отстраним проблема по-бързо, ако " +
            "посочите:",
        },
        {
          ul: [
            "адреса или името на страницата;",
            "какво сте се опитали да направите;",
            "какво се е случило вместо очакваното;",
            "устройството и браузъра, които използвате;",
            "помощната технология, ако използвате такава.",
          ],
        },
        {
          p:
            "Ще потвърдим получаването на сигнала ви до 10 работни дни и ще ви " +
            "информираме какви действия можем да предприемем и в какъв срок.",
        },
        {
          p:
            "Можете също да поискате определено съдържание в друг достъпен " +
            "формат. Ще потърсим разумен начин да ви го предоставим.",
        },
      ],
    },
    {
      title: "VI. Външно съдържание и известни ограничения",
      blocks: [
        {
          p:
            "Част от съдържанието може да се предоставя чрез външни платформи, " +
            "които не разработваме и не управляваме, например плейъри за " +
            "вградени видеа.",
        },
        {
          p:
            "Докато не стартирате такова съдържание, страницата остава под наш " +
            "контрол. След стартирането му някои функции зависят от " +
            "достъпността на съответната платформа.",
        },
        {
          p:
            "Ако външно съдържание ви попречи да получите нужната информация, " +
            "свържете се с нас. Ще потърсим достъпна алтернатива, когато това е " +
            "възможно.",
        },
      ],
    },
    {
      title: "VII. Техническа основа",
      blocks: [
        { p: "Достъпността на сайта разчита на следните технологии:" },
        {
          ul: [
            "HTML5;",
            "CSS;",
            "JavaScript;",
            "WAI-ARIA, само когато семантиката на стандартния HTML не е достатъчна.",
          ],
        },
        {
          p:
            "Страниците се изобразяват предварително, а основното текстово " +
            "съдържание остава достъпно и без изпълнение на JavaScript.",
        },
        { p: CLOSING_BG },
      ],
    },
  ] satisfies LegalSection[],
};

const en: typeof bg = {
  meta: {
    title: "Accessibility Statement — Bulgarian Design Council",
    description:
      "The Bulgarian Design Council's commitment to the accessibility of this " +
      "site, the standard we work to, what we have done, and how to tell us if " +
      "something stops you.",
  },
  title: "Accessibility Statement",
  lead: "for the website of the Bulgarian Design Council",
  updated: "Last updated on 3 August 2026.",
  backLabel: "← Back to home",
  onThisPage: "On this page",
  sections: [
    {
      title: "I. Our promise",
      blocks: [
        { p: "Accessibility is a condition of equal participation." },
        {
          p:
            "The Bulgarian Design Council stands for design that serves people. " +
            "So we start with our own digital environment. A site that shuts " +
            "some people out contradicts the principles we argue for.",
        },
        {
          p:
            "We design and develop this site so that as many people as possible " +
            "can find information, understand the content and take part fully. " +
            "That includes people who:",
        },
        {
          ul: [
            "use a screen reader or other assistive technology;",
            "navigate by keyboard alone;",
            "enlarge the text or use a small screen;",
            "perceive colour differently or are sensitive to contrast;",
            "prefer reduced motion;",
            "have temporary, situational or permanent difficulties.",
          ],
        },
        {
          p:
            "For us accessibility is not a one-off check. It is a standing " +
            "responsibility to listen, to find the barriers and to remove them.",
        },
      ],
    },
    {
      title: "II. Standard and current state",
      blocks: [
        {
          p:
            "We designed and built the site to conform with the Web Content " +
            "Accessibility Guidelines (WCAG) 2.2, Level AA.",
        },
        {
          p:
            "As at the date of the last self-assessment we found no known " +
            "non-conformances in the pages and components tested. That statement " +
            "rests on internal automated and manual testing. It is not an " +
            "independent certification and it does not replace testing with " +
            "people who use a range of assistive technologies.",
        },
        {
          p:
            "WCAG defines conformance at the level of a whole page, including " +
            "its responsive variants, not of individual components alone. So we " +
            "review accessibility whenever the design, the content or the " +
            "functionality changes significantly.",
        },
      ],
    },
    {
      title: "III. What we have done",
      blocks: [
        { h: "Structure and clarity" },
        {
          ul: [
            "We use semantic HTML with clearly marked regions — header, nav, main and footer.",
            "Every page has one main heading and a consistent hierarchy with no skipped levels.",
            "We declare the correct page language with lang=\"bg\" or lang=\"en\", so screen readers pronounce the text properly.",
            "We provide a \"skip to main content\" link so repeated navigation can be bypassed.",
            "We write clear headings, descriptive links and understandable button text.",
          ],
        },
        { h: "Images and media" },
        {
          ul: [
            "Informative images carry meaningful alt text in Bulgarian and English.",
            "Galleries use descriptions that convey the meaning and context of the photographs.",
            "Decorative images are hidden from assistive technology so they do not add noise.",
            "Videos neither load nor start automatically. We show a still frame until the visitor chooses to play them.",
          ],
        },
        { h: "Keyboard and focus" },
        {
          ul: [
            "The site's main functions can be operated by keyboard.",
            "Interactive elements have a visible focus indicator.",
            "Panels and dialogs can be closed with the Esc key.",
            "Focus moves to a sensible place when interactive elements open and close.",
            "The fixed navigation never hides the focused element.",
            "Close buttons have an activation area of at least 44 by 44 CSS pixels.",
          ],
        },
        {
          p:
            "44 by 44 pixels exceeds the 24 by 24 CSS pixel minimum required for " +
            "WCAG 2.2 AA and follows the higher criterion for improved usability.",
        },
        { h: "Contrast, scaling and motion" },
        {
          ul: [
            "Every text combination tested meets the Level AA contrast requirement.",
            "The lowest contrast ratio measured across the pages tested is 5.29:1, against a 4.5:1 minimum for standard text.",
            "The site adapts to different screen sizes and to enlarged text.",
            "We respect the system prefers-reduced-motion setting.",
            "Where a visitor has chosen reduced motion, animations and automatic carousel movement stop.",
            "Every automatically moving carousel has a visible pause control.",
          ],
        },
        { h: "Privacy and uninterrupted access" },
        {
          p:
            "The site currently uses no analytics or advertising tracking " +
            "scripts, and loads no unnecessary consent banner that could trap " +
            "focus or block content.",
        },
        {
          p:
            "If we introduce optional cookies or external tools in future, we " +
            "will assess them for accessibility before switching them on.",
        },
      ],
    },
    {
      title: "IV. Enlarging the text",
      blocks: [
        { p: "You can enlarge the text through your browser settings:" },
        {
          ul: [
            "on Windows and Linux: Ctrl and +;",
            "on macOS: ⌘ and +;",
            "to return to the default size: Ctrl or ⌘ and 0.",
          ],
        },
        {
          p:
            "The site reflows to the width of your screen, so the content stays " +
            "readable on a phone, a tablet and a wide monitor.",
        },
      ],
    },
    {
      title: "V. Tell us when something stops you",
      blocks: [
        {
          p:
            "Automated checks cannot find every barrier. The test that matters " +
            "most is real use of the site.",
        },
        { p: "If you run into difficulty, write to us at:" },
        { a: { text: CONTACT, href: `mailto:${CONTACT}` } },
        { p: "You will help us understand and fix the problem faster if you tell us:" },
        {
          ul: [
            "the address or name of the page;",
            "what you were trying to do;",
            "what happened instead;",
            "the device and browser you are using;",
            "the assistive technology, if you use one.",
          ],
        },
        {
          p:
            "We will acknowledge your report within 10 working days and tell you " +
            "what we can do and by when.",
        },
        {
          p:
            "You can also ask for particular content in another accessible " +
            "format. We will look for a reasonable way to provide it.",
        },
      ],
    },
    {
      title: "VI. External content and known limitations",
      blocks: [
        {
          p:
            "Some content may be delivered through external platforms that we " +
            "neither build nor control — embedded video players, for example.",
        },
        {
          p:
            "Until you start such content, the page remains under our control. " +
            "Once it starts, some behaviour depends on that platform's own " +
            "accessibility.",
        },
        {
          p:
            "If external content prevents you from getting the information you " +
            "need, contact us. We will look for an accessible alternative where " +
            "one is possible.",
        },
      ],
    },
    {
      title: "VII. Technical basis",
      blocks: [
        { p: "The accessibility of this site relies on the following technologies:" },
        {
          ul: [
            "HTML5;",
            "CSS;",
            "JavaScript;",
            "WAI-ARIA, only where the semantics of standard HTML are not enough.",
          ],
        },
        {
          p:
            "Pages are prerendered, and the main text content remains available " +
            "without JavaScript running.",
        },
        { p: CLOSING_EN },
      ],
    },
  ] satisfies LegalSection[],
};

export type AccessibilityContent = typeof bg;

export function getAccessibilityContent(locale: Locale): AccessibilityContent {
  return locale === "en" ? en : bg;
}
