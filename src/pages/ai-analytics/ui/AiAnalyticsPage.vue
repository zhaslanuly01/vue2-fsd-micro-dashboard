<template>
  <div class="ai-analytics-page">
    <section class="ai-analytics-page__hero">
      <div class="ai-analytics-page__hero-content">
        <div class="ai-analytics-page__eyebrow">AI-powered insights</div>
        <h1 class="ai-analytics-page__title">AI Analytics</h1>
        <p class="ai-analytics-page__subtitle">
          Задавайте вопросы по operational dashboard, получайте сводки, приоритеты и быстрые инсайты
          по выбранному разделу.
        </p>

        <div class="ai-analytics-page__hero-badges">
          <span class="ai-analytics-page__badge">
            {{ activeMode === 'mock' ? 'Mock mode' : 'Real AI mode' }}
          </span>
          <span class="ai-analytics-page__badge"> Раздел: {{ selectedPageLabel }} </span>
        </div>
      </div>
    </section>

    <el-card shadow="never" class="ai-analytics-page__toolbar">
      <div class="ai-analytics-page__toolbar-grid">
        <div class="ai-analytics-page__field">
          <div class="ai-analytics-page__label">Раздел</div>
          <el-select
            v-model="selectedPage"
            placeholder="Выберите раздел"
            class="ai-analytics-page__select"
          >
            <el-option
              v-for="option in pageOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <div class="ai-analytics-page__field">
          <div class="ai-analytics-page__label">Режим</div>
          <el-radio-group v-model="activeMode" size="small" class="ai-analytics-page__mode-switch">
            <el-radio-button label="mock">Mock</el-radio-button>
            <el-radio-button label="real">Real AI</el-radio-button>
          </el-radio-group>
        </div>

        <div class="ai-analytics-page__field ai-analytics-page__field--actions">
          <div class="ai-analytics-page__label">Действия</div>
          <div class="ai-analytics-page__toolbar-actions">
            <el-button size="small" @click="handleClear">Очистить чат</el-button>
            <el-button size="small" type="primary" plain @click="sendQuickQuestion(defaultPrompt)">
              Быстрый старт
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <div class="ai-analytics-page__layout">
      <section class="ai-analytics-page__chat-panel">
        <el-card shadow="never" class="ai-analytics-page__chat-card">
          <div class="ai-analytics-page__chat-top">
            <div>
              <div class="ai-analytics-page__section-title">Диалог</div>
              <div class="ai-analytics-page__chat-subtitle">
                {{
                  activeMode === 'mock'
                    ? 'Локальный demo-режим для UI и сценариев'
                    : 'Реальный backend-запрос к AI'
                }}
              </div>
            </div>

            <transition name="fade">
              <div v-if="loading" class="ai-analytics-page__status">
                <span class="ai-analytics-page__status-dot" />
                AI думает...
              </div>
            </transition>
          </div>

          <div ref="messagesContainer" class="ai-analytics-page__messages">
            <transition-group name="message-fade" tag="div">
              <div
                v-for="message in messages"
                :key="message.id"
                class="ai-analytics-page__message"
                :class="{
                  'ai-analytics-page__message--user': message.role === 'user',
                  'ai-analytics-page__message--assistant': message.role === 'assistant'
                }"
              >
                <div class="ai-analytics-page__bubble">
                  <div class="ai-analytics-page__message-meta">
                    <span class="ai-analytics-page__message-role">
                      {{ message.role === 'user' ? 'Вы' : 'AI' }}
                    </span>
                  </div>

                  <div class="ai-analytics-page__message-text">{{ message.text }}</div>
                </div>
              </div>
            </transition-group>

            <transition name="fade">
              <div v-if="loading" class="ai-analytics-page__thinking">
                <div class="ai-analytics-page__thinking-bubble">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </transition>
          </div>

          <div class="ai-analytics-page__composer">
            <div class="ai-analytics-page__composer-top">
              <div class="ai-analytics-page__composer-context">
                <span class="ai-analytics-page__composer-pill">
                  {{ activeMode === 'mock' ? 'Mock' : 'Real AI' }}
                </span>
                <span class="ai-analytics-page__composer-pill">
                  {{ selectedPageLabel }}
                </span>
              </div>
            </div>

            <el-input
              v-model="question"
              type="textarea"
              :rows="4"
              resize="none"
              class="ai-analytics-page__textarea"
              :placeholder="inputPlaceholder"
              @keydown.native="handleKeydown"
            />

            <div class="ai-analytics-page__composer-footer">
              <div class="ai-analytics-page__composer-hint">
                Enter — отправить, Shift + Enter — новая строка
              </div>

              <el-button
                type="primary"
                :loading="loading"
                :disabled="!question.trim() || loading"
                @click="handleSend"
              >
                Отправить
              </el-button>
            </div>
          </div>
        </el-card>
      </section>

      <aside class="ai-analytics-page__side-panel">
        <el-card
          shadow="never"
          class="ai-analytics-page__side-card ai-analytics-page__side-card--sticky"
        >
          <div class="ai-analytics-page__section-title">Контекст</div>

          <div class="ai-analytics-page__context-grid">
            <div class="ai-analytics-page__context-item">
              <div class="ai-analytics-page__context-label">Текущий раздел</div>
              <div class="ai-analytics-page__context-value">{{ selectedPageLabel }}</div>
            </div>

            <div class="ai-analytics-page__context-item">
              <div class="ai-analytics-page__context-label">Режим</div>
              <div class="ai-analytics-page__context-value">
                {{ activeMode === 'mock' ? 'Mock' : 'Real AI' }}
              </div>
            </div>

            <div class="ai-analytics-page__context-item">
              <div class="ai-analytics-page__context-label">Что анализируется</div>
              <div class="ai-analytics-page__context-note">
                page, question, filters и компактный context/stats payload
              </div>
            </div>
          </div>

          <div class="ai-analytics-page__divider" />

          <div class="ai-analytics-page__section-title">Быстрые сценарии</div>
          <div class="ai-analytics-page__prompt-list">
            <button
              v-for="prompt in quickPrompts"
              :key="prompt"
              type="button"
              class="ai-analytics-page__prompt-button"
              @click="sendQuickQuestion(prompt)"
            >
              {{ prompt }}
            </button>
          </div>

          <div class="ai-analytics-page__divider" />

          <div class="ai-analytics-page__section-title">Как лучше спрашивать</div>
          <div class="ai-analytics-page__tips">
            <div class="ai-analytics-page__tip">
              Уточняй: “по каким объектам”, “почему”, “что проверить первым”.
            </div>
            <div class="ai-analytics-page__tip">
              Для real AI лучше задавать конкретные вопросы по выбранному разделу.
            </div>
            <div class="ai-analytics-page__tip">
              Mock подходит для demo и UI-сценариев без расходов API.
            </div>
          </div>
        </el-card>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { AiChatPayload, AiMessage } from '@/features/ai-assistant/model/ai-assistant.types'
import { getMockAiReply } from '@/features/ai-assistant/lib/mock-ai'
import { sendAiMessage } from '@/features/ai-assistant/api/chat.api'

type AiMode = 'mock' | 'real'

interface PageOption {
  label: string
  value: string
}

function createMessage(role: 'user' | 'assistant', text: string): AiMessage {
  return {
    id: `${role}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    role,
    text,
    createdAt: new Date().toISOString()
  }
}

function createInitialMessage(mode: AiMode): AiMessage {
  return createMessage(
    'assistant',
    mode === 'mock'
      ? 'Привет! Это mock-режим. Выбери раздел и задай вопрос — я покажу demo-ответы.'
      : 'Привет! Это real AI режим. Выбери раздел и задай вопрос — я попробую проанализировать текущий контекст.'
  )
}

export default Vue.extend({
  name: 'AIAnalyticsPage',

  data() {
    return {
      selectedPage: 'equipment',
      activeMode: 'mock' as AiMode,
      question: '',
      mockMessages: [createInitialMessage('mock')] as AiMessage[],
      realMessages: [createInitialMessage('real')] as AiMessage[],
      mockLoading: false,
      realLoading: false
    }
  },

  computed: {
    pageOptions(): PageOption[] {
      return [
        { label: 'Оборудование', value: 'equipment' },
        { label: 'Скважины', value: 'well' },
        { label: 'Добыча по месторождениям', value: 'oil-field' },
        { label: 'Заявки на обслуживание', value: 'maintenance-requests' },
        { label: 'Резервуары', value: 'storage-tank' },
        { label: 'Экологический мониторинг', value: 'eco-station' },
        { label: 'Транспортировка', value: 'pipeline-section' }
      ]
    },

    selectedPageLabel(): string {
      const current = this.pageOptions.find((item) => item.value === this.selectedPage)
      return current ? current.label : this.selectedPage
    },

    messages(): AiMessage[] {
      return this.activeMode === 'mock' ? this.mockMessages : this.realMessages
    },

    loading(): boolean {
      return this.activeMode === 'mock' ? this.mockLoading : this.realLoading
    },

    inputPlaceholder(): string {
      return this.activeMode === 'mock'
        ? 'Например: Сделай сводку по странице и выдели основные риски'
        : 'Например: Какие объекты требуют внимания и почему?'
    },

    defaultPrompt(): string {
      return 'Сделай краткую сводку по странице'
    },

    quickPrompts(): string[] {
      return [
        'Сделай краткую сводку по странице',
        'Какие объекты требуют внимания?',
        'Есть ли аномалии в данных?',
        'Что стоит проверить в первую очередь?'
      ]
    }
  },

  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      },
      deep: true
    },

    activeMode() {
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    }
  },

  methods: {
    buildPayload(question: string): AiChatPayload {
      return {
        page: this.selectedPage,
        question,
        filters: {},
        context: {
          source: 'ai-analytics-page'
        }
      }
    },

    pushUserMessage(text: string) {
      const message = createMessage('user', text)

      if (this.activeMode === 'mock') {
        this.mockMessages.push(message)
      } else {
        this.realMessages.push(message)
      }
    },

    pushAssistantMessage(text: string) {
      const message = createMessage('assistant', text)

      if (this.activeMode === 'mock') {
        this.mockMessages.push(message)
      } else {
        this.realMessages.push(message)
      }
    },

    setLoading(value: boolean) {
      if (this.activeMode === 'mock') {
        this.mockLoading = value
      } else {
        this.realLoading = value
      }
    },

    async handleSend() {
      const text = this.question.trim()

      if (!text || this.loading) {
        return
      }

      this.question = ''
      await this.askByMode(text)
    },

    async sendQuickQuestion(text: string) {
      if (this.loading) {
        return
      }

      await this.askByMode(text)
    },

    async askByMode(text: string) {
      const payload = this.buildPayload(text)

      this.pushUserMessage(text)
      this.setLoading(true)

      try {
        if (this.activeMode === 'mock') {
          const response = await getMockAiReply(payload)
          this.pushAssistantMessage(response.message)
        } else {
          const response = await sendAiMessage(payload)
          this.pushAssistantMessage(response.message)
        }
      } catch (error) {
        console.error(error)
        this.pushAssistantMessage('Не удалось получить ответ. Попробуй еще раз.')
      } finally {
        this.setLoading(false)
      }
    },

    handleClear() {
      if (this.activeMode === 'mock') {
        this.mockMessages = [createInitialMessage('mock')]
        this.mockLoading = false
      } else {
        this.realMessages = [createInitialMessage('real')]
        this.realLoading = false
      }
    },

    handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.handleSend()
      }
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer as HTMLElement | undefined

      if (!container) {
        return
      }

      container.scrollTop = container.scrollHeight
    }
  }
})
</script>

<style scoped>
.ai-analytics-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.ai-analytics-page__hero {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 28px;
  background:
    radial-gradient(circle at top right, rgba(64, 158, 255, 0.18), transparent 28%),
    radial-gradient(circle at bottom left, rgba(103, 194, 58, 0.12), transparent 24%),
    linear-gradient(135deg, #ffffff 0%, #f7faff 100%);
  border: 1px solid rgba(64, 158, 255, 0.14);
}

.ai-analytics-page__hero-content {
  position: relative;
  z-index: 1;
  max-width: 760px;
}

.ai-analytics-page__eyebrow {
  display: inline-flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ai-analytics-page__title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.15;
  color: var(--label-primary);
}

.ai-analytics-page__subtitle {
  margin: 12px 0 0;
  max-width: 680px;
  color: var(--label-secondary);
  line-height: 1.6;
}

.ai-analytics-page__hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.ai-analytics-page__badge {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e8eef5;
  color: var(--label-primary);
  font-size: 13px;
  font-weight: 600;
}

.ai-analytics-page__toolbar,
.ai-analytics-page__chat-card,
.ai-analytics-page__side-card {
  border-radius: 20px;
  border: 1px solid #edf2f7;
  transition:
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

.ai-analytics-page__toolbar:hover,
.ai-analytics-page__chat-card:hover,
.ai-analytics-page__side-card:hover {
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.ai-analytics-page__toolbar-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.8fr) minmax(240px, auto);
  gap: 16px;
  align-items: end;
}

.ai-analytics-page__field {
  min-width: 0;
}

.ai-analytics-page__field--actions {
  align-self: stretch;
}

.ai-analytics-page__label {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--label-secondary);
}

.ai-analytics-page__toolbar-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ai-analytics-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.9fr);
  gap: 16px;
  align-items: start;
}

.ai-analytics-page__chat-panel,
.ai-analytics-page__side-panel {
  min-width: 0;
}

.ai-analytics-page__chat-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.ai-analytics-page__section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--label-primary);
}

.ai-analytics-page__chat-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--label-secondary);
}

.ai-analytics-page__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f5faff;
  border: 1px solid #dcecff;
  color: #409eff;
  font-size: 13px;
  font-weight: 600;
}

.ai-analytics-page__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  animation: pulse 1.2s infinite ease-in-out;
}

.ai-analytics-page__messages {
  min-height: 520px;
  max-height: 520px;
  overflow-y: auto;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(245, 247, 250, 1) 100%);
  border: 1px solid #eef2f6;
  scroll-behavior: smooth;
}

.ai-analytics-page__message {
  display: flex;
  margin-bottom: 14px;
}

.ai-analytics-page__message--user {
  justify-content: flex-end;
}

.ai-analytics-page__message--assistant {
  justify-content: flex-start;
}

.ai-analytics-page__bubble {
  max-width: 82%;
  padding: 14px 16px;
  border-radius: 18px;
  white-space: pre-line;
  word-break: break-word;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

.ai-analytics-page__message--user .ai-analytics-page__bubble {
  background: linear-gradient(135deg, #409eff 0%, #2f7fe0 100%);
  color: #fff;
  border-bottom-right-radius: 8px;
}

.ai-analytics-page__message--assistant .ai-analytics-page__bubble {
  background: #fff;
  color: #303133;
  border: 1px solid #ebeef5;
  border-bottom-left-radius: 8px;
}

.ai-analytics-page__message-meta {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.ai-analytics-page__message-role {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.8;
}

.ai-analytics-page__message-text {
  font-size: 14px;
  line-height: 1.6;
}

.ai-analytics-page__thinking {
  display: flex;
  justify-content: flex-start;
  margin-top: 6px;
}

.ai-analytics-page__thinking-bubble {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 42px;
  padding: 0 14px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

.ai-analytics-page__thinking-bubble span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #b9c2cf;
  animation: blink 1.2s infinite ease-in-out;
}

.ai-analytics-page__thinking-bubble span:nth-child(2) {
  animation-delay: 0.15s;
}

.ai-analytics-page__thinking-bubble span:nth-child(3) {
  animation-delay: 0.3s;
}

.ai-analytics-page__composer {
  margin-top: 16px;
  padding: 16px;
  border-radius: 18px;
  background: #fbfcfe;
  border: 1px solid #eef2f6;
}

.ai-analytics-page__composer-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.ai-analytics-page__composer-context {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-analytics-page__composer-pill {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e8eef5;
  font-size: 12px;
  font-weight: 700;
  color: var(--label-secondary);
}

.ai-analytics-page__composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.ai-analytics-page__composer-hint {
  font-size: 12px;
  color: var(--label-secondary);
}

.ai-analytics-page__side-card--sticky {
  position: sticky;
  top: 16px;
}

.ai-analytics-page__context-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-analytics-page__context-item {
  padding: 12px 14px;
  border-radius: 14px;
  background: #fafbfd;
  border: 1px solid #edf2f7;
}

.ai-analytics-page__context-label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--label-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.ai-analytics-page__context-value,
.ai-analytics-page__context-note {
  color: var(--label-primary);
  line-height: 1.5;
}

.ai-analytics-page__divider {
  height: 1px;
  margin: 18px 0;
  background: #edf2f7;
}

.ai-analytics-page__prompt-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-analytics-page__prompt-button {
  padding: 12px 14px;
  border: 1px solid #e8eef5;
  border-radius: 14px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: var(--label-primary);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.ai-analytics-page__prompt-button:hover {
  transform: translateY(-1px);
  border-color: #cfe5ff;
  box-shadow: 0 8px 18px rgba(64, 158, 255, 0.08);
  background: #f9fcff;
}

.ai-analytics-page__tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-analytics-page__tip {
  padding: 12px 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fafcff 0%, #f6faff 100%);
  border: 1px solid #e7f0fb;
  color: var(--label-primary);
  line-height: 1.5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.message-fade-enter-active {
  transition: all 0.22s ease;
}

.message-fade-leave-active {
  transition: all 0.18s ease;
}

.message-fade-enter,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.12);
  }
}

@media (max-width: 1280px) {
  .ai-analytics-page__layout {
    grid-template-columns: 1fr;
  }

  .ai-analytics-page__side-card--sticky {
    position: static;
  }
}

@media (max-width: 991px) {
  .ai-analytics-page__toolbar-grid {
    grid-template-columns: 1fr;
  }

  .ai-analytics-page__messages {
    min-height: 460px;
    max-height: 460px;
  }
}

@media (max-width: 768px) {
  .ai-analytics-page__hero {
    padding: 20px;
    border-radius: 18px;
  }

  .ai-analytics-page__title {
    font-size: 26px;
  }

  .ai-analytics-page__composer-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .ai-analytics-page__messages {
    min-height: 400px;
    max-height: 400px;
    padding: 14px;
  }

  .ai-analytics-page__bubble {
    max-width: 92%;
  }
}

@media (max-width: 575px) {
  .ai-analytics-page__title {
    font-size: 22px;
  }

  .ai-analytics-page__subtitle {
    font-size: 14px;
  }

  .ai-analytics-page__hero,
  .ai-analytics-page__toolbar,
  .ai-analytics-page__chat-card,
  .ai-analytics-page__side-card {
    border-radius: 14px;
  }

  .ai-analytics-page__messages {
    min-height: 340px;
    max-height: 340px;
    padding: 12px;
  }

  .ai-analytics-page__composer {
    padding: 12px;
    border-radius: 14px;
  }
}
</style>
