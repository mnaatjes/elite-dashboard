<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="layout-container">
    <aside class="sidebar">
      <h2>Elite Dashboard</h2>
      <nav>
        <ul>
          <li><RouterLink to="/">Dashboard</RouterLink></li>
          <li><RouterLink to="/catalog">Catalog</RouterLink></li>
          <li><RouterLink to="/settings">Settings</RouterLink></li>
        </ul>
      </nav>
    </aside>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
nav ul {
  list-style: none;
  padding: 0;
}
nav li {
  margin-bottom: 0.5rem;
}
</style>
