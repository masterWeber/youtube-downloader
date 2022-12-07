<template>
  <p class="scrollable-string" ref="container" @mouseenter="calcScroll()">
    <span class="scrollable-string__inner" ref="inner">{{ value }}</span>
  </p>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';

const props = defineProps<{
  value: string
}>()

const container = ref()
const inner = ref()

const scrollWidth = ref<number>(0)
const scrollWidthInPX = computed<string>(() => `${scrollWidth.value}px`)
const duration = computed<string>(() => {
  let value = Math.max(scrollWidth.value * -60, 4000)
  return `${value}ms`
})

const calcScroll = (): void => {
  const containerWidth = container.value.getBoundingClientRect().width
  const innerWidth = inner.value.getBoundingClientRect().width
  scrollWidth.value = Math.round(-(innerWidth - containerWidth))
}
</script>

<style scoped>
.scrollable-string {
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.scrollable-string:hover {
  animation: text-clip;
  animation-delay: 300ms;
  animation-fill-mode: forwards;
}

.scrollable-string__inner {
  margin-left: 0;
}

.scrollable-string:hover .scrollable-string__inner {
  animation: scroll-string v-bind(duration);
  animation-delay: 300ms;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

@keyframes text-clip {
  from {
    text-overflow: ellipsis;
  }
  to {
    text-overflow: clip;
  }
}

@keyframes scroll-string {
  0% {
    margin-left: 0;
  }
  30% {

    margin-left: v-bind(scrollWidthInPX);
  }
  60% {
    margin-left: v-bind(scrollWidthInPX);
  }
  80% {
    margin-left: 0;
  }
  100% {
    margin-left: 0;
  }
}
</style>