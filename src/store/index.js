import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('main', () => {
  const selectedKeys = ref('welcome')
  return { selectedKeys }
})