import type { Translations } from "../translations";

export default {
  // Nav
  "nav.home": "CodeAtlas",
  "nav.faq": "常見問題",

  // Hero
  "hero.title": "全球開發者排行榜",
  "hero.description":
    "追蹤 {count} 個國家的開發者，依 GitHub 貢獻排名。每週更新。",
  "hero.countries": "{count} 個國家",

  // Continents
  "continent.asia": "亞洲",
  "continent.europe": "歐洲",
  "continent.americas": "美洲",
  "continent.africa": "非洲",
  "continent.oceania": "大洋洲",

  // Globe
  "globe.clickToExplore": "點擊探索",

  // Search
  "search.placeholder": "搜尋國家...",

  // Country page
  "country.loading": "載入中...",
  "country.notFound": "找不到國家",
  "country.loadError": "無法載入「{code}」的資料",
  "country.backToHome": "← 返回 CodeAtlas",
  "country.developers": "位開發者",
  "country.contributions": "次貢獻",
  "country.updated": "更新時間",
  "country.share": "分享{name}排行榜",
  "country.topDevelopers": "{name}頂尖 GitHub 開發者",
  "country.ogDescription":
    "{country}前 {count} 名 GitHub 開發者，依貢獻數和追蹤者排名。",

  // Ranking filter
  "ranking.public": "公開貢獻",
  "ranking.total": "總貢獻",
  "ranking.followers": "追蹤者",
  "ranking.searchDeveloper": "搜尋開發者...",
  "ranking.allCities": "所有城市",
  "ranking.noResults": "沒有結果",
  "ranking.clearFilters": "清除篩選",
  "ranking.clearAll": "清除全部",
  "ranking.of": "/",
  "ranking.developers": "位開發者",

  // Profile page
  "profile.loading": "載入中...",
  "profile.notFound": "找不到",
  "profile.userNotFound": "在{country}找不到使用者「{name}」",
  "profile.loadError": "無法載入「{name}」的資料",
  "profile.backTo": "← 返回{name}",
  "profile.contributions": "貢獻數",
  "profile.followers": "追蹤者",
  "profile.github": "GitHub",
  "profile.blog": "部落格",
  "profile.languages": "程式語言",
  "profile.topRepos": "熱門儲存庫",
  "profile.viewOnGithub": "在 GitHub 查看完整個人檔案",
  "profile.shareProfile": "分享個人檔案",
  "profile.shareText": "{name}在 CodeAtlas {country}排名 #{rank}！",
  "profile.ogDescription":
    "{name}在{country}的 GitHub 開發者中排名第 {rank} 名。",

  // Theme
  "theme.switchToLight": "切換至淺色主題",
  "theme.switchToDark": "切換至深色主題",

  // Share
  "share.copied": "已複製 ✓",
  "share.copyLink": "複製連結",

  // Heatmap
  "heatmap.label": "貢獻活動熱力圖",
  "heatmap.less": "少",
  "heatmap.more": "多",
  "heatmap.contributions": "次貢獻",

  // App router
  "app.pageNotFound": "找不到頁面",
  "app.backToHome": "← 返回 CodeAtlas",

  // Footer
  "footer.text": "CodeAtlas · 資料來自 GitHub API · 每週更新 · ",

  // FAQ page
  "faq.title": "常見問題 — CodeAtlas",
  "faq.backHome": "← 首頁",
  "faq.heading": "常見問題",
  "faq.backToCodeAtlas": "← 返回 CODEATLAS",

  "faq.q1": "如何被收錄？",
  "faq.a1":
    "CodeAtlas 會自動根據 GitHub 個人檔案的地點來索引使用者。請確認你的 GitHub 個人檔案已設定<strong>地點</strong>為可辨識的城市或國家（例如「Taipei, Taiwan」或「Taiwan」）。你也需要有一定的公開活動（貢獻或追蹤者）。",

  "faq.q2": "排名如何計算？",
  "faq.a2.intro": "我們提供三種排名維度：",
  "faq.a2.public":
    "<strong>公開貢獻</strong> — 公開儲存庫的 commits、PR、issues 和 reviews（來自 GitHub 貢獻日曆）",
  "faq.a2.total":
    "<strong>總貢獻</strong> — 公開 + 私人貢獻（私人貢獻數來自 GraphQL <code>restrictedContributionsCount</code>）",
  "faq.a2.followers": "<strong>追蹤者</strong> — GitHub 追蹤者數量",

  "faq.q3": "資料多久更新一次？",
  "faq.a3":
    "排名透過 GitHub Actions <strong>每週</strong>更新。每個國家頁面上的「<strong>更新時間</strong>」顯示最近的資料刷新時間。",

  "faq.q4": "為什麼我沒有被收錄？",
  "faq.a4.intro": "常見原因：",
  "faq.a4.r1": "你的 GitHub 個人檔案地點為空或不符合可辨識的城市/國家",
  "faq.a4.r2": "你的地點使用了 emoji 國旗而非文字（我們正在支援此功能）",
  "faq.a4.r3": "你的公開貢獻或追蹤者數量太少",
  "faq.a4.r4": "資料尚未刷新 — 請在每週更新後再查看",

  "faq.q5": "我的資料有誤，如何修正？",
  "faq.a5":
    "排名直接從 GitHub API 取得。如果你的貢獻數看起來不對，請檢查你的 <strong>GitHub 個人檔案設定</strong>，確認已啟用「<strong>私人貢獻</strong>」。資料將在下次每週更新時刷新。",

  "faq.q6": "如何新增國家或城市？",
  "faq.a6":
    "CodeAtlas 使用簡單的 JSON 設定系統。要新增國家或城市，請提交 PR 在 <code>config/countries/</code> 新增檔案。詳情請見 <strong>CONTRIBUTING.md</strong>。",

  "faq.q7": "資料來源是什麼？",
  "faq.a7":
    '所有資料來自 <a href="https://docs.github.com/en/rest" target="_blank" rel="noopener" class="text-accent hover:underline">GitHub REST API</a> 和 <a href="https://docs.github.com/en/graphql" target="_blank" rel="noopener" class="text-accent hover:underline">GitHub GraphQL API</a>。我們使用 Search API 依地點搜尋使用者，再透過 GraphQL 取得貢獻資料。',

  // Locale switcher
  "locale.en": "English",
  "locale.zh-TW": "中文",
} satisfies Translations;
