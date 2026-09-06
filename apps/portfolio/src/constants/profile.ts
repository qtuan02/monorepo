/**
 * Where the CV's owner can be reached, written once.
 *
 * Three separate places want these: the hero's quick actions, the contact
 * lines, and the dock. They live in `~/constants` rather than in any one of
 * those slices because a slice may not import another slice's constants — and
 * a URL copied per call site is the kind of duplicate that only shows up as a
 * dead link, months later, in the one copy nobody remembered to change.
 */
export const PROFILE_LINKS = {
  email: "mailto:huynhquoctuan200702@gmail.com",
  phone: "tel:+84393653862",
  github: "https://github.com/qtuan02",
  linkedin: "https://www.linkedin.com/in/tuan-huynh-916b792b7",
} as const;
