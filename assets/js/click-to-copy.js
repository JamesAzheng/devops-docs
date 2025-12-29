let codeListings = document.querySelectorAll(".highlight > pre");
for (let t = 0; t < codeListings.length; t++) {
  const s = codeListings[t].querySelector("code"),
        e = document.createElement("button"),
        o = {
          type: "button",
          title: "复制到剪贴板",
          "data-bs-toggle": "tooltip",
          "data-bs-placement": "top",
          "data-bs-container": "body"
        };
  Object.keys(o).forEach(t => {
    e.setAttribute(t, o[t]);
  }),
  e.classList.add("fas", "fa-copy", "btn", "btn-sm", "td-click-to-copy");
  const i = new bootstrap.Tooltip(e);
  e.onclick = () => {
    copyCode(s),
    e.setAttribute("data-bs-original-title", "已复制!"),
    i.show();
  },
  e.onmouseout = () => {
    e.setAttribute("data-bs-original-title", "复制到剪贴板"),
    i.hide();
  };
  const n = document.createElement("div");
  n.classList.add("click-to-copy"),
  n.append(e),
  codeListings[t].insertBefore(n, s);
}
const copyCode = e => {
  const t = e.textContent.trim() + `\n`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(t);
  } else {
    const o = document.createElement("textarea");
    o.value = t;
    o.style.position = "fixed";
    o.style.opacity = 0;
    document.body.appendChild(o);
    o.select();
    document.execCommand("copy");
    document.body.removeChild(o);
  }
};