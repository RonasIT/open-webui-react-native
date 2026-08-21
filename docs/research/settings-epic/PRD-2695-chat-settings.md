# PRD-2695 — Implement chat settings functionality

ClickUp: https://app.clickup.com/t/86cb75jrz
Родительская задача: `86cb5zj4w`
Статус на 2026-08-20: to-do
Figma: https://www.figma.com/design/YPCZjyVlD86psDwUxvMVBc/Open-MobileUI-React-Native?node-id=30543-21989

## Что нужно сделать (из ClickUp)

Самая крупная задача эпика: раздел **Chats**, 10 пунктов — Archived chats,
Export all chats, Archive all, Delete all, Always-on web search, Haptic
feedback, Enable message queue, Chat bubble UI, Temporary chat by default,
Render markdown in user message. Полные требования и тест-сценарии по каждому
пункту — см. ClickUp.

## Важная находка: дублирование с PRD-2690

Пункт 6 "**Haptic feedback**" в этой задаче — тот же самый функционал, что и
вся задача [PRD-2690 "Haptic Feedback"](./PRD-2690-haptic-feedback.md)
(которая, судя по коду, в основном уже реализована через
`hapticFeedbackService` + `appStorageService.hapticFeedback`). Нужно уточнить
у продакта/в ClickUp, не задвоенная ли это работа — если PRD-2690 уже сделан,
здесь достаточно переиспользовать готовый toggle/сервис в новом месте UI, а
не делать вторую реализацию.

## Несоответствие в тикете (тест-сценарий 7)

Тест-сценарий 7 в ClickUp ("Test Markdown renderer... Open the renderer
selector... select another available renderer") описывает выбор ДВИЖКА
рендеринга markdown из нескольких вариантов — это НЕ то же самое, что пункт 10
"Render markdown in user message" (простой boolean toggle). Похоже, сценарий 7
относится к отдельной задаче PRD-2689 "Select Markdown Renderer" (в проекте
уже есть `appStorageService.markdownRenderer`, что подтверждает — это
отдельная, скорее всего уже реализованная функциональность), а не к этому
тикету. Нужно уточнить перед реализацией.

## Разбор API OpenWebUI (проверено по исходникам open-webui/open-webui)

**Toggles** — через `GET/POST /api/v1/users/user/settings(/update)`, merge +
full replace (как в PRD-2692):

| Пункт тикета                    | Поле в settings.ui (референсный веб-клиент) | Тип                                  | Дефолт  |
| ------------------------------- | ------------------------------------------- | ------------------------------------ | ------- |
| Always-on web search            | `webSearch`                                 | **`null \| 'always'`** (НЕ boolean!) | `null`  |
| Haptic feedback                 | `hapticFeedback`                            | boolean                              | —       |
| Enable message queue            | `enableMessageQueue`                        | boolean                              | `true`  |
| Chat bubble UI                  | `chatBubble`                                | boolean                              | —       |
| Temporary chat by default       | `temporaryChatByDefault`                    | boolean                              | `false` |
| Render markdown in user message | `renderMarkdownInUserMessages`              | boolean                              | —       |

`webSearch` — единственная ловушка: НЕ `true/false`, а `null` (выкл) / строка
`'always'` (вкл). Реализация как boolean сломает совместимость с бэкендом/
другими клиентами, читающими то же поле.

**Bulk-операции с чатами** (`backend/open_webui/routers/chats.py`):

- `GET /api/v1/chats/archived` — список архивных (params: `page`, `query`,
  `order_by`, `direction`)
- `POST /api/v1/chats/{id}/archive` — архивировать/разархивировать один чат
  (toggle одного и того же вызова — **подтверждено в реальном коде проекта**,
  см. ниже)
- `POST /api/v1/chats/archive/all` — архивировать все активные чаты → `bool`
- `DELETE /api/v1/chats/` — удалить **ВСЕ** чаты текущего пользователя → `bool`.
  **Подтверждено официальной документацией: удаляет и активные, и архивные
  чаты** — прямой ответ на открытый вопрос из тикета ("clarify whether this
  includes archived chats").
- `GET /api/v1/chats/all` — экспорт всех чатов, **StreamingResponse в формате
  NDJSON** (`application/x-ndjson`), не JSON-массив целиком.
- `GET /api/v1/chats/` или `/list` — обычный список чатов с пагинацией (для
  рефреша списков после bulk-операций).

Источники: [routers/chats.py](https://github.com/open-webui/open-webui/blob/main/backend/open_webui/routers/chats.py),
[Settings/Interface.svelte](https://github.com/open-webui/open-webui/blob/main/src/lib/components/chat/Settings/Interface.svelte),
[Message Queue docs](https://docs.openwebui.com/features/chat-conversations/chat-features/message-queue/),
[Archived Chats docs](https://docs.openwebui.com/features/chat-conversations/data-controls/archived-chats/),
[Discussion #10603 — Delete All deletes archived too](https://github.com/open-webui/open-webui/discussions/10603)

## Сверка с реальным кодом этого проекта (2026-08-20)

- `libs/shared/data-access/api/src/lib/chats/api.ts` — уже есть
  `useArchiveChat` и `useUnarchiveChat`, оба вызывают
  `chatService.archiveChat(id)` (**подтверждает**: это toggle-эндпоинт, один
  и тот же вызов на архивацию и разархивацию, отличается только
  react-query cache-инвалидация).
- Уже есть `useGetArchivedChatList` (infinite query,
  `chatService.getArchivedChatList`) и `useGetAllArchivedChatsJson`
  (`chatService.getAllArchivedChats`) — экран Archived chats может почти
  полностью переиспользовать существующий слой, не создавать новый.
- `useDelete` — единичное удаление чата, уже инвалидирует archived-list заодно.
- **НЕТ** пока bulk-хуков: `archive all`, `delete all`, `export all` не
  реализованы в `chatApi` — это и есть основной новый объём работы по
  API-слою для этого тикета (нужно добавить в `chats/api.ts` + `chats/
service.ts`, по образцу уже существующих хуков в этом же файле).
- `UiSettings` модель (`libs/shared/data-access/api/src/lib/users/models/
ui-settings.ts`) пока содержит только `version`, `models`, `system` — ни
  одного из шести toggle-полей (`webSearch`, `chatBubble`,
  `enableMessageQueue`, `temporaryChatByDefault`,
  `renderMarkdownInUserMessages`) там ещё нет. `hapticFeedback` в проекте —
  локальный (MMKV), а не через `UiSettings`. **Открытый архитектурный
  вопрос**: остальные пять toggle'ов реализовывать через backend `UiSettings`
  (как в апстриме, синхронизация между устройствами) или локально через
  `appStorageService` (как уже сделано для hapticFeedback/locale/
  markdownRenderer)? В коде это ещё не решено — нужно решить осознанно, а не
  копировать не проверенное предположение.

## Промпт для реализации

```
Задача: реализовать функциональность раздела Chats в настройках приложения
(PRD-2695, ClickUp: https://app.clickup.com/t/86cb75jrz). Родительский эпик:
86cb5zj4w (см. также PRD-2690 Haptic Feedback, PRD-2691, PRD-2692, PRD-2693,
PRD-2694). Figma: https://www.figma.com/design/YPCZjyVlD86psDwUxvMVBc/
Open-MobileUI-React-Native?node-id=30543-21989

ПЕРЕД НАЧАЛОМ — важно уточнить:
1. Пункт 6 "Haptic feedback" в этом тикете дублирует задачу PRD-2690 "Haptic
   Feedback" (тот же toggle). В коде уже есть hapticFeedbackService
   (libs/shared/utils/haptic-feedback-service) и
   appStorageService.hapticFeedback (MMKV) — похоже, PRD-2690 в основном
   реализован. Уточни, не задвоенная ли это работа; если PRD-2690 сделан —
   просто подключи существующий toggle к новому месту в Chats settings,
   не дублируй реализацию.
2. Тест-сценарий 7 в тикете ("Test Markdown renderer... Open the renderer
   selector... select another available renderer") описывает выбор ДВИЖКА
   рендеринга markdown из нескольких вариантов — это НЕ то же самое, что
   пункт 10 "Render markdown in user message" (простой boolean toggle). В
   коде уже есть appStorageService.markdownRenderer — похоже, это отдельная
   задача (PRD-2689 "Select Markdown Renderer"). Уточни, требуется ли что-то
   дополнительно здесь, прежде чем изобретать отдельный "renderer selector"
   для пункта 10.
3. АРХИТЕКТУРНОЕ РЕШЕНИЕ, которое нужно принять перед стартом: пять
   оставшихся toggle'ов (webSearch, chatBubble, enableMessageQueue,
   temporaryChatByDefault, renderMarkdownInUserMessages) сейчас НЕ заведены
   ни в backend-модели UiSettings (libs/shared/data-access/api/src/lib/users/
   models/ui-settings.ts — там только version/models/system), ни в
   appStorageService (там только token/apiUrl/locale/markdownRenderer/
   hapticFeedback). Нужно решить: синхронизировать через backend (расширить
   UiSettings, как в референсном веб-клиенте OpenWebUI — тогда настройка
   переживает переустановку/смену устройства) или хранить локально в MMKV
   (как уже сделано для hapticFeedback/locale/markdownRenderer — тогда
   настройка привязана к устройству). Рекомендация: для webSearch
   (используется бэкендом в chat/completions запросах) и
   temporaryChatByDefault (может влиять на серверную логику создания чата) —
   вероятно нужен backend-sync через UiSettings, аналогично system/models.
   Для chatBubble, enableMessageQueue, renderMarkdownInUserMessages — это
   чисто клиентские UI-настройки, по аналогии с hapticFeedback их логично
   хранить локально. Но это предположение, не готовое решение — сверься с
   продактом/тимлидом, если неочевидно из Figma.
4. Найди существующий API-слой чатов (libs/shared/data-access/api/src/lib/
   chats/) — там уже есть useArchiveChat/useUnarchiveChat (оба вызывают один
   и тот же chatService.archiveChat(id) — toggle-эндпоинт),
   useGetArchivedChatList, useGetAllArchivedChatsJson, useDelete (для одного
   чата). Bulk-хуки (archive all / delete all / export all) нужно добавить
   туда же, по образцу существующих, а НЕ создавать параллельный API-слой.

Контракт backend OpenWebUI (проверено по исходникам open-webui/open-webui):

--- Settings (для полей, которые решено синхронизировать через backend —
    persist через usersApi.useGetUserSettings/useUpdateUserSettings, тот же
    merge-паттерн, что и в General settings — full replace объекта, поэтому
    перед сохранением одного поля мёржь его с уже загруженными settings,
    иначе затрёшь остальные настройки пользователя) ---
    webSearch: null | 'always'   -- НЕ boolean! off = null, on = 'always'
    hapticFeedback: boolean       -- см. п.1 выше, скорее всего уже local-only
    enableMessageQueue: boolean  -- дефолт true
    chatBubble: boolean
    temporaryChatByDefault: boolean  -- дефолт false
    renderMarkdownInUserMessages: boolean

--- Bulk chat operations ---
    GET    /api/v1/chats/archived   -- список архивных, params: page, query,
                                        order_by, direction (уже покрыто
                                        useGetArchivedChatList)
    POST   /api/v1/chats/{id}/archive  -- архивировать/разархивировать один
                                        чат (уже покрыто useArchiveChat/
                                        useUnarchiveChat — переиспользуй их
                                        для restore из архива)
    POST   /api/v1/chats/archive/all   -- архивировать все активные чаты,
                                        response: bool (НУЖНО добавить хук)
    DELETE /api/v1/chats/              -- удалить ВСЕ чаты пользователя.
                                        ПОДТВЕРЖДЕНО: удаляет и активные, и
                                        архивные разом. Именно так реализуй
                                        Delete all — без отдельной логики
                                        "включать архивные или нет", бэкенд
                                        решает это сам. (НУЖНО добавить хук)
    GET    /api/v1/chats/all           -- экспорт всех чатов. Это НЕ обычный
                                        JSON-ответ, а StreamingResponse в
                                        формате NDJSON (application/x-ndjson,
                                        построчный JSON). Клиент должен читать
                                        поток построчно (или дождаться полной
                                        загрузки и распарсить построчно), а не
                                        пытаться JSON.parse() весь ответ разом.
                                        (НУЖНО добавить хук)
    GET    /api/v1/chats/ (или /list)  -- обычный список чатов с пагинацией,
                                        для рефреша списков после bulk-операций
                                        (уже покрыто useGetChatList)

Реализация по пунктам:

1) Archived chats
- Кликабельный пункт -> отдельный экран, useGetArchivedChatList (уже есть,
  infinite query).
- Состояния: loading, empty (нет архивных чатов), error (сбой загрузки).
- Actions на чате в списке: restore = useUnarchiveChat (уже есть). Permanently
  delete = useDelete (уже есть, единичное удаление чата — переиспользуй).
- Убедиться, что на этом экране показываются ТОЛЬКО архивные чаты (фильтрация
  на бэкенде уже это гарантирует через отдельный endpoint).

2) Export all chats
- Кликабельный пункт -> новый хук на базе GET /api/v1/chats/all, читать
  NDJSON поток.
- Т.к. это может занять время на больших объёмах — показать явный
  in-progress/loading state, не блокирующий весь UI намертво.
- Guard от повторных тапов, пока экспорт не завершится.
- Формат доставки: следуй существующему паттерну проекта (если для экспорта
  чего-то ещё уже есть механизм "поделиться файлом"/сохранить на устройство —
  используй его; не изобретай новый способ доставки файла).
- Успех -> явное сообщение/следующий шаг (например, "поделиться файлом").
  Ошибка сети/парсинга потока -> явный error state, не молчаливый провал.

3) Archive all
- Кликабельный пункт -> confirmation-диалог перед действием.
- Новый хук useArchiveAllChats (POST /api/v1/chats/archive/all) после
  подтверждения.
- После успеха -> инвалидировать useGetChatList / useGetPinnedChatList /
  useGetArchivedChatList queryKey (по аналогии с тем, как это уже сделано в
  useArchiveChat для одного чата).
- Guard от повторных тапов (дизейблить кнопку на время запроса).
- Partial failure: эндпоинт возвращает просто bool — если бэкенд не даёт
  детализации по отдельным чатам, трактуй false/ошибку как общий failure,
  покажи ошибку и не делай вид, что всё прошло успешно.

4) Delete all
- Кликабельный пункт -> УСИЛЕННОЕ подтверждение (т.к. деструктивное и
  необратимое действие — минимум double-confirm или ввод подтверждающего
  текста, сверься с Figma по паттерну, который там заложен).
- Новый хук useDeleteAllChats (DELETE /api/v1/chats/) после подтверждения.
  Помни: это удаляет и активные, и архивные чаты — так и должно быть, это не
  баг и не нужно разделять логику.
- После успеха -> инвалидировать/сбросить все связанные query keys (активные +
  архивные + pinned).
- Guard от повторных тапов.
- Защита от случайного срабатывания: подтверждающий UI не должен закрываться
  случайным тапом мимо/свайпом без явного отказа.

5-10) Toggles (Always-on web search, Haptic feedback [см. п.1 выше про
дублирование с PRD-2690], Enable message queue, Chat bubble UI, Temporary
chat by default, Render markdown in user message)
- См. п.3 "ПЕРЕД НАЧАЛОМ" про архитектурное решение backend-sync vs
  local-only для каждого поля.
- Для полей, которые решено синхронизировать через backend: общий паттерн —
  при открытии экрана загрузить usersApi.useGetUserSettings(), отобразить
  состояние тумблеров; при переключении — сохранить через merge + вызов
  usersApi.useUpdateUserSettings() с ТЕМ ЖЕ полным объектом settings, где
  изменено только соответствующее поле.
- webSearch — ИСКЛЮЧЕНИЕ из общего паттерна: значение toggle ВКЛ должно
  писать строку 'always', ВЫКЛ — null (не true/false). Применение:
  подставлять в запросы к chat/completions там, где приложение уже
  прокидывает web-search параметр (см.
  libs/shared/data-access/api/src/lib/chats/models/features.ts и
  chats/utils/prepare-complete-chat-payload.ts — там уже должна быть точка
  расширения). Если для каких-то моделей/режимов web search не поддерживается
  — сохранённое значение не менять, просто не применять его в
  неподдерживаемом запросе (тихо игнорировать на уровне вызова).
- hapticFeedback — переиспользуй существующий hapticFeedbackService +
  appStorageService.hapticFeedback (local-only, MMKV), см. PRD-2690.
- enableMessageQueue — применяется в логике отправки сообщений: при true
  (дефолт) — новое сообщение во время генерации ставится в очередь и
  объединяется/отправляется после завершения текущей генерации; при false —
  новое сообщение сразу прерывает текущую генерацию. Переключение toggle НЕ
  должно ломать уже идущую в моменте переключения генерацию/очередь — новое
  значение применяется к следующим отправкам, а не ретроактивно.
- chatBubble — переключает UI-режим отображения сообщений (bubble vs другой
  существующий режим в дизайне). После смены значения экран чата должен
  визуально обновиться без необходимости выходить и заходить заново.
- temporaryChatByDefault — применяется только к НОВЫМ чатам, создаваемым
  после включения (см. chats/utils/prepare-create-chat-payload.ts). Существующие
  чаты не должны задним числом менять свой temporary/persistent статус.
- renderMarkdownInUserMessages — применяется к рендерингу СООБЩЕНИЙ
  ПОЛЬЗОВАТЕЛЯ (не ответов ИИ — это другое поле
  renderMarkdownInAssistantMessages, не участвует в этом тикете). При off —
  обычный plain text рендеринг должен работать корректно.

Общие требования (из ClickUp):
- Все пункты видимы и интерактивны при открытии Chats settings; сохранённые
  значения тумблеров отображаются корректно.
- Значения тумблеров переживают перезапуск/релогин.
- Ошибка загрузки настроек -> явный error state.
- Ошибка сохранения любого тумблера -> явная ошибка, предыдущее значение
  сохраняется (UI не должен "залипать" на новом значении, которое не удалось
  сохранить).
- Никакого debug-вывода/ошибок в консоли в финальной версии.

Тест-план (сверить со сценариями из ClickUp PRD-2695, пункт 7 про markdown
renderer — см. открытый вопрос №2 выше, возможно относится к другой задаче):
1. Открыть Chats settings — все пункты видимы и интерактивны, сохранённые
   значения тумблеров корректны.
2. Archived chats: показаны только архивные, корректные loading/empty/error
   состояния, restore/delete работают.
3. Export all chats: флоу стартует, при асинхронности — progress/in-progress
   state, повторные быстрые тапы не создают дублирующих запросов, успех
   показывает сообщение, ошибка — явный error state.
4. Archive all: confirmation -> подтверждение -> все активные заархивированы,
   уже архивные повторно не обрабатываются, списки обновляются, повторные
   тапы не дублируют запрос, partial/полный failure обрабатывается безопасно.
5. Delete all: усиленное confirmation -> подтверждение -> чаты удалены
   согласно правилам продукта (активные + архивные), списки обновляются,
   повторные тапы не дублируют запрос, failure обрабатывается безопасно.
6. Каждый из 6 тумблеров: смена значения сохраняется, переживает рестарт/
   релогин, связанное поведение в приложении меняется корректно.
7. (см. открытый вопрос) Markdown renderer selector — уточнить относится ли
   к этому тикету.
8. Общие ошибки: сбой загрузки настроек (error state), сбой сохранения
   тумблера/значения (предыдущее значение сохранено), рестарт/релогин ->
   настройки остаются корректными.
9. Убедиться в отсутствии debug-логов/ошибок в консоли.

Сдать: реализацию всех пунктов Chats settings с указанным API-контрактом
(включая нестандартный тип поля webSearch), NDJSON-обработкой экспорта,
усиленным подтверждением для Delete all, обработкой ошибок/partial failure
для bulk-операций и персистентностью тумблеров, покрывающую тест-сценарии
выше. Перед стартом реализации — разрешить открытые вопросы (дублирование с
PRD-2690, несоответствие тест-сценария 7 пункту 10, backend-sync vs
local-only для пяти оставшихся toggle-полей).
```
