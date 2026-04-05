<template>
  <button class="ai-assistant-button" type="button" @click="$emit('click')">
    <span class="ai-assistant-button__icon"> </span>

    <span class="ai-assistant-button__text">
      <span class="ai-assistant-button__title">AI Analytics</span>
      <span class="ai-assistant-button__subtitle">Ask dashboard</span>
    </span>
  </button>
</template>

<style scoped>
.ai-assistant-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1200;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
  height: 64px;
  padding: 0 18px 0 14px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  color: #fff;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.22), transparent 35%),
    linear-gradient(135deg, #111827 0%, #1f2937 45%, #0f766e 100%);
  box-shadow:
    0 12px 32px rgba(15, 23, 42, 0.28),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.ai-assistant-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 36px rgba(15, 23, 42, 0.32),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.ai-assistant-button:active {
  transform: translateY(0);
}

.ai-assistant-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  flex-shrink: 0;
}

/* Updated slightly to target the SVG component directly */
.ai-assistant-button__icon svg {
  width: 22px;
  height: 22px;
}

.ai-assistant-button__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.ai-assistant-button__title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.1;
}

.ai-assistant-button__subtitle {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.1;
  opacity: 0.78;
}

@media (max-width: 768px) {
  .ai-assistant-button {
    right: 16px;
    bottom: 16px;
    min-width: 64px;
    width: 64px;
    height: 64px;
    padding: 0;
    justify-content: center;
  }

  .ai-assistant-button__text {
    display: none;
  }

  .ai-assistant-button__icon {
    width: 44px;
    height: 44px;
  }
}
</style>
