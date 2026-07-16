(() => {
  const pages = [
    { id: "pet", label: "Pet", detail: "いっしょに暮らす", href: "/game/" },
    { id: "bgm", label: "BGM", detail: "音のおへや", href: "/game/bgm/" },
    { id: "shooting", label: "Shooting", detail: "星を守る", href: "/game/shooting/" },
    { id: "run", label: "Run", detail: "夜空を走る", href: "/game/run/" },
    { id: "raising", label: "育成", detail: "ゆーりを育てる", href: "/game/raising/" },
    { id: "tilt", label: "Tilt", detail: "傾けて遊ぶ", href: "/game/tilt/" },
  ];

  const current = document.body.dataset.yuuriPage || "pet";

  const makeLink = (page, className) => {
    const link = document.createElement("a");
    link.className = className;
    link.href = page.href;
    link.dataset.yuuriTarget = page.id;
    if (page.id === current) link.setAttribute("aria-current", "page");

    const label = document.createElement("strong");
    label.textContent = page.label;
    const detail = document.createElement("small");
    detail.textContent = page.detail;
    link.append(label, detail);
    return link;
  };

  if (current === "pet") {
    const topbar = document.querySelector(".app > .topbar");
    if (!topbar) return;

    const strip = document.createElement("section");
    strip.className = "yuuri-hub-strip";
    strip.setAttribute("aria-label", "UFOゆーりゲームサイト");

    const brand = document.createElement("a");
    brand.className = "yuuri-hub-brand";
    brand.href = "/game/";
    brand.innerHTML = "<small>UFO Yuri Game World</small><strong>Petを中心に、ぜんぶひとつに</strong>";

    const links = document.createElement("nav");
    links.className = "yuuri-hub-links";
    links.setAttribute("aria-label", "ゲームを選ぶ");
    pages.forEach((page) => links.append(makeLink(page, "yuuri-hub-link")));
    strip.append(brand, links);
    topbar.after(strip);
    return;
  }

  const active = pages.find((page) => page.id === current) || pages[0];
  const menu = document.createElement("details");
  menu.className = "yuuri-world-menu";

  const summary = document.createElement("summary");
  summary.textContent = `UFOゆーり・${active.label}`;
  summary.title = "ゲームをえらぶ";
  summary.setAttribute("aria-label", `ゲームをえらぶ・現在は${active.label}`);

  const panel = document.createElement("div");
  panel.className = "yuuri-world-panel";

  const heading = document.createElement("div");
  heading.className = "yuuri-world-heading";
  heading.innerHTML = "<strong>ゲームをえらぶ</strong><small>Petがホーム</small>";

  const links = document.createElement("nav");
  links.className = "yuuri-world-links";
  links.setAttribute("aria-label", "UFOゆーりゲームサイト");
  pages.forEach((page) => links.append(makeLink(page, "yuuri-world-link")));

  panel.append(heading, links);
  menu.append(summary, panel);
  document.body.append(menu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") menu.open = false;
  });

  document.addEventListener("pointerdown", (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
})();
