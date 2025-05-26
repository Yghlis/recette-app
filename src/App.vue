<!-- src/App.vue -->
<template>
  <div id="app">
    <header class="app-header">
      <div class="logo">
        <img src="./assets/logoAi.png" alt="Recettes Personnalisées Logo" />
        <h1>Recettes Personnalisées</h1>
      </div>

      <nav class="nav-bar">
        <router-link to="/">Accueil</router-link>
        <router-link to="/create">Créer une recette</router-link>
        <router-link to="/ingredients">Gérer Ingrédients</router-link>
        <!-- nouveau lien -->
        <router-link to="/generate">Générer une recette</router-link>
      </nav>

      <SearchBar @search="handleSearch" />
    </header>

    <main class="app-main">
      <RouterView v-slot="{ Component }" :search-query="searchQuery">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";

const searchQuery = ref("");

const handleSearch = (q) => {
  searchQuery.value = q;
};
</script>

<style scoped lang="scss">
.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  img {
    width: 100px;
  }
}

.nav-bar {
  color: $primary-color;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  a {
    text-decoration: none;
    color: inherit;
    font-weight: bold;
    padding: 8px 16px;
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover, &.router-link-active {
      background-color: $primary-color;
      color: white;
    }
  }
}




.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
