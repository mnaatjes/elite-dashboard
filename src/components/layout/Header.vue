<template>
  <header class="app-header">
    <div class="breadcrumbs">
      <!-- Simple path display for wireframe -->
      <span>Admin / {{ currentRouteName }}</span>
    </div>
    <div class="user-actions">
      <button class="btn btn-outline-danger fw-bold" disabled>Logout</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentRouteName = computed(() => {
  return route.name ? route.name.toString().charAt(0).toUpperCase() + route.name.toString().slice(1) : ''
})
</script>

<style scoped>
.app-header {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.05);
}
.breadcrumbs {
  font-weight: bold;
}
</style>
