function setMeta(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function updateMeta({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  if (title) {
    document.title = title;
    setMeta("property", "og:title", title);
  }
  if (description) {
    setMeta("name", "description", description);
    setMeta("property", "og:description", description);
  }
}
