<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <h2>Elite Dashboard</h2>
    </div>
    <nav>
      <ul class="nav-list">
        <li><RouterLink to="/" class="nav-btn">Dashboard</RouterLink></li>
        <li><RouterLink to="/sources" class="nav-btn">Sources</RouterLink></li>
        <li><RouterLink to="/catalog" class="nav-btn">Catalog (HitL)</RouterLink></li>
        <li><RouterLink to="/lineage" class="nav-btn">Data Lineage</RouterLink></li>
        <li><RouterLink to="/settings" class="nav-btn">Settings</RouterLink></li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.05);
}
.sidebar-brand h2 {
  margin-top: 0;
  margin-bottom: 2rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0d6efd;
}
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.nav-btn {
  display: block;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #495057;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.2s ease-in-out;
}
.nav-btn:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
  border-color: #dee2e6;
  transform: translateX(4px);
}
.nav-btn.router-link-active {
  background-color: #e9ecef;
  color: #0d6efd;
  font-weight: 700;
}
</style>
