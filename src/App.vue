<script setup>
import { RouterView } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'
</script>

<template>
  <div class="layout-container">
    <Sidebar />
    <div class="main-wrapper">
      <Header />
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  padding: 1rem;
  gap: 1rem;
  background-color: #f4f5f7;
}
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}
.main-content {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
  box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.05);
}
</style>
