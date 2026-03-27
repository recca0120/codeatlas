---
name: tdd
description: TDD（Test-Driven Development）最佳實踐指南。當需要撰寫測試、實踐 TDD、設計測試結構、或討論測試策略時使用。也應在用戶要建置新專案、開發新功能、或寫程式練習時主動套用，確保開發流程從一開始就遵循 Red-Green-Refactor 循環，而非事後補測試。
---

# TDD Best Practices Guide (2025-2026)

## Canon TDD（Kent Beck 2025）

Kent Beck 在 2025 正式定義 Canon TDD：

1. **寫測試清單** — 列出要覆蓋的場景（先想再寫）
2. **將一個項目轉為具體、可執行的測試** — 只寫一個
3. **讓測試通過**（以及所有先前的測試），發現新場景就加到清單
4. **（可選）重構** — 不改變行為

## Red-Green-Refactor

### Red（紅燈）
- 寫一個**單一失敗測試**
- 思考 API 設計：程式碼如何被使用
- 測試必須失敗才有意義

### Green（綠燈）
- 寫**最少量程式碼**讓測試通過
- 允許寫醜的程式碼 — 不要最佳化
- 只管讓它綠

### Refactor（重構）
- 改善結構、命名、去重複、可讀性
- **不改變行為** — 測試必須全程保持綠色
- 如果重構破壞測試 → 測試耦合了實作（修測試）

## Transformation Priority Premise（TPP）

Green 步驟的簡單到複雜排序，優先用上面的：

1. `{} → nil`
2. `nil → constant`
3. `constant → constant+`
4. `constant → scalar`（變數/參數）
5. `statement → statements`
6. `unconditional → if`
7. `scalar → array`
8. `array → container`
9. `statement → recursion`
10. `if → while`
11. `expression → function`

**如果需要跳到複雜轉換 → 你選錯了下一個測試，重新排序測試清單。**

## Inside-Out vs Outside-In

### Chicago School（Inside-Out）
- 從**領域層**向外寫到 API/Controller
- **狀態驗證**（assert 物件狀態）
- 最少 mock，用真實協作者
- 適合：**領域邏輯、演算法、資料轉換**
- 測試更耐重構

### London School（Outside-In）
- 從**外層**（API/Controller）向內寫
- **行為驗證**（verify 協作者呼叫）
- 在過程中發現介面與依賴
- 適合：**使用者功能、API endpoints、協調層**

### 2025 共識
兩者是**互補工具**，不是競爭哲學：
- Chicago 用於核心領域邏輯
- London 用於整合/協調層
- 大多數有效團隊會依情境混合使用

## 測試結構

### AAA（Arrange-Act-Assert）

```typescript
it('calculates total with tax', () => {
  // Arrange
  const cart = new Cart([{ price: 100 }, { price: 200 }]);

  // Act
  const total = cart.totalWithTax(0.1);

  // Assert
  expect(total).toBe(330);
});
```

### Given-When-Then（BDD 風格）

語意相同，使用領域語言：

```typescript
it('given items in cart, when calculating with 10% tax, then returns sum plus tax', () => {
  // Given
  const cart = new Cart([{ price: 100 }, { price: 200 }]);
  // When
  const total = cart.totalWithTax(0.1);
  // Then
  expect(total).toBe(330);
});
```

**原則**：每個測試一個動作、一個邏輯斷言（多個 expect 可以，只要驗證同一概念）。

## TDD + AI Agent（2025-2026 新趨勢）

Kent Beck 和 Simon Willison 都認為 TDD 是與 AI agent 協作的**超能力**：

- **人類寫測試**（指定意圖）→ **Agent 寫實作**
- 測試防止 agent 寫出不工作或不必要的程式碼
- 自動建立回歸安全網
- 流程：寫失敗測試 → 讓 agent 產生實作 → 驗證通過 → 重構

## 何時 TDD 最有價值

### 最有價值
- 領域邏輯與商業規則
- API 開發（清楚的 input/output）
- Library / Framework 程式碼
- 演算法程式碼
- 與 AI agent 協作
- 重構既有程式碼

### 較不適合
- 高度實驗性/探索性程式碼（先 spike 再 TDD）
- 純 UI layout/styling
- 薄的第三方包裝
- 一次性腳本

## Refactor 步驟的技巧

- 去除重複 → 合併為函式
- 改善命名 → 意圖揭示的名稱
- Extract method → 拆分大函式
- 簡化條件 → guard clause 或多態
- 引入 parameter object → 參數太多時
- 替換 magic value → 命名常數

**時機**：發現 code smell 立即處理，最遲不超過 3 個 baby-step。

## TDD Anti-Patterns

| Anti-Pattern | 說明 |
|---|---|
| The Liar | 測試通過但沒測到該測的 |
| Excessive Setup | 巨大的 Arrange 代表太多依賴（設計問題） |
| The Giant | 一個測試太多斷言 |
| The Slow Poke | 測試太慢導致開發者不跑 |
| Testing Implementation | 耦合內部結構而非可觀察行為 |
| No Refactoring | 跳過 refactor 步驟 |
| 100% Coverage Obsession | 追求 100% 而非有意義的 70-80% |
| No Test List | 沒有先規劃場景就直接寫 |

## Frontend vs Backend TDD

### Backend
- 直觀：清楚的 input/output
- Domain service、use case、repository 都適合 TDD
- Chicago 適合領域邏輯、London 適合 controller

### Frontend
- **TDD 適合**：元件邏輯、狀態管理、hooks、API 互動、表單驗證
- **不適合 TDD**：pixel layout、CSS styling、動畫
- 測試使用者能看到和做的事（文字、互動、導航），不測 DOM 結構或 CSS class

## 與此專案的搭配

在 GitStar 專案中：
- **Country Config / Data Collection**：Chicago school — 純邏輯，用真實物件或 Fake
- **3D Visualization**：Mock WebGLRenderer，測試場景邏輯
- **Social Sharing**：測試 OG meta 產生、URL 組裝
- 每個 task 開始前先寫測試清單，再 Red-Green-Refactor
