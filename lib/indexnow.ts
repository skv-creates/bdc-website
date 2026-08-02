/**
 * IndexNow — tell search engines a page changed instead of waiting to be
 * crawled.
 *
 * Worth knowing what this does and does not cover. Bing, Yandex, Seznam and
 * Naver consume IndexNow; **Google does not**, and Google also retired its
 * sitemap ping endpoint in 2023, so the only way to nudge Google is Search
 * Console. There is no automatable substitute for that.
 *
 * The key is not a secret. It authenticates nothing except "whoever posts this
 * also controls the site", which is proven by the matching file being
 * reachable at the site's own root — that is the whole protocol. It is
 * committed on purpose; a rotated key that only lives in someone's shell is a
 * key nobody can verify against.
 */
export const INDEXNOW_KEY = "bf9a221bfdc6076c401caf93bda0fa56";

/** Where the proving file lives; the API refuses a submission without it. */
export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;
