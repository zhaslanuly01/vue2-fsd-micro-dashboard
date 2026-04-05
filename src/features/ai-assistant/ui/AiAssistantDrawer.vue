<template>
  <el-drawer
    :visible.sync="localVisible"
    :with-header="false"
    :size="drawerSize"
    custom-class="ai-assistant-drawer"
    append-to-body
    @close="handleClose"
  >
    <div class="ai-assistant">
      <div class="ai-assistant__header">
        <div>
          <h3 class="ai-assistant__title">AI Assistant</h3>
          <p class="ai-assistant__subtitle">
            {{
              activeMode === 'mock'
                ? 'Mock mode. Локальные ответы.'
                : 'Real AI mode. Ответы через backend.'
            }}
          </p>
        </div>

        <div class="ai-assistant__actions">
          <el-button size="mini" @click="handleClear">Очистить</el-button>
          <el-button icon="el-icon-close" circle size="mini" @click="handleClose" />
        </div>
      </div>

      <div class="ai-assistant__tabs">
        <el-radio-group v-model="activeMode" size="small">
          <el-radio-button label="mock">Mock</el-radio-button>
          <el-radio-button label="real">Real AI</el-radio-button>
        </el-radio-group>
      </div>

      <div ref="messagesContainer" class="ai-assistant__messages">
        <div
          v-for="message in messages"
          :key="message.id"
          class="ai-assistant__message"
          :class="{
            'ai-assistant__message--user': message.role === 'user',
            'ai-assistant__message--assistant': message.role === 'assistant'
          }"
        >
          <div class="ai-assistant__bubble">
            <div class="ai-assistant__message-role">
              {{ message.role === 'user' ? 'Вы' : 'AI' }}
            </div>
            <div class="ai-assistant__message-text">{{ message.text }}</div>
          </div>
        </div>

        <div v-if="loading" class="ai-assistant__loading">AI думает...</div>
      </div>

      <div class="ai-assistant__quick-actions">
        <el-button size="mini" @click="sendQuickQuestion('Сделай краткую сводку по странице')">
          Сводка
        </el-button>
        <el-button size="mini" @click="sendQuickQuestion('Какие объекты требуют внимания?')">
          Риски
        </el-button>
        <el-button size="mini" @click="sendQuickQuestion('Есть ли аномалии в данных?')">
          Аномалии
        </el-button>
      </div>

      <div class="ai-assistant__input">
        <el-input
          v-model="question"
          type="textarea"
          :rows="3"
          resize="none"
          placeholder="Например: Какие объекты требуют внимания?"
          @keydown.native="handleKeydown"
        />

        <div class="ai-assistant__footer">
          <div class="ai-assistant__context">
            Страница: <strong>{{ page }}</strong>
          </div>

          <el-button
            type="primary"
            :loading="loading"
            :disabled="!question.trim()"
            @click="handleSend"
          >
            Отправить
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts">
import Vue from 'vue'
import type { AiMessage, AiChatPayload } from '../model/ai-assistant.types'
import { buildAiContext } from '../lib/build-ai-context'
import { getMockAiReply } from '../lib/mock-ai'
import { sendAiMessage } from '../api/chat.api'

type AiMode = 'mock' | 'real'

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
      ? 'Привет! Это mock-режим. Могу показать демо-ответы по странице.'
      : 'Привет! Это real AI режим. Отвечаю через backend и OpenAI.'
  )
}

export default Vue.extend({
  name: 'AiAssistantDrawer',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    page: {
      type: String,
      required: true
    },
    filters: {
      type: Object,
      default: () => ({})
    },
    selectedItem: {
      type: Object,
      default: null
    },
    stats: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      question: '',
      activeMode: 'mock' as AiMode,
      mockMessages: [createInitialMessage('mock')] as AiMessage[],
      realMessages: [createInitialMessage('real')] as AiMessage[],
      mockLoading: false,
      realLoading: false,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1440
    }
  },

  computed: {
    localVisible: {
      get(): boolean {
        return this.visible
      },
      set(value: boolean) {
        this.$emit('update:visible', value)
      }
    },

    messages(): AiMessage[] {
      return this.activeMode === 'mock' ? this.mockMessages : this.realMessages
    },

    loading(): boolean {
      return this.activeMode === 'mock' ? this.mockLoading : this.realLoading
    },

    drawerSize(): string {
      return this.windowWidth <= 768 ? '100%' : '420px'
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

  mounted() {
    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
    },

    buildPayload(question: string): AiChatPayload {
      const baseContext = buildAiContext({
        page: this.page,
        filters: this.filters,
        selectedItem: this.selectedItem,
        stats: this.stats
      })

      return {
        ...baseContext,
        question
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

    handleClose() {
      this.localVisible = false
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
.ai-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.ai-assistant__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #ebeef5;
}

.ai-assistant__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.ai-assistant__subtitle {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.ai-assistant__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-assistant__tabs {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
  background: #fff;
}

.ai-assistant__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: #f5f7fa;
}

.ai-assistant__message {
  display: flex;
  margin-bottom: 12px;
}

.ai-assistant__message--user {
  justify-content: flex-end;
}

.ai-assistant__message--assistant {
  justify-content: flex-start;
}

.ai-assistant__bubble {
  max-width: 85%;
  padding: 12px 14px;
  border-radius: 14px;
  white-space: pre-line;
  word-break: break-word;
}

.ai-assistant__message--user .ai-assistant__bubble {
  background: #409eff;
  color: #fff;
  border-bottom-right-radius: 6px;
}

.ai-assistant__message--assistant .ai-assistant__bubble {
  background: #fff;
  color: #303133;
  border: 1px solid #ebeef5;
  border-bottom-left-radius: 6px;
}

.ai-assistant__message-role {
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
}

.ai-assistant__message-text {
  font-size: 14px;
  line-height: 1.5;
}

.ai-assistant__loading {
  font-size: 13px;
  color: #909399;
}

.ai-assistant__quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  background: #fff;
}

.ai-assistant__input {
  padding: 16px 20px 20px;
  border-top: 1px solid #ebeef5;
  background: #fff;
}

.ai-assistant__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.ai-assistant__context {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .ai-assistant__header,
  .ai-assistant__tabs,
  .ai-assistant__messages,
  .ai-assistant__quick-actions,
  .ai-assistant__input {
    padding-left: 16px;
    padding-right: 16px;
  }

  .ai-assistant__bubble {
    max-width: 92%;
  }

  .ai-assistant__footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
