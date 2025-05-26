<!-- src/App.vue -->
<template>
  <div id="app">
    <header class="app-header">
      <h1>Recettes Personnalisées</h1>

      <nav class="nav-bar">
        <router-link to="/">Accueil</router-link>
        <router-link to="/create">Créer une recette</router-link>
        <router-link to="/ingredients">Gérer Ingrédients</router-link>
        <!-- nouveau lien -->
        <router-link to="/generate">Générer une recette</router-link>
      </nav>

    </header>

    <main class="app-main">
      <router-view :search-query="searchQuery" />
    </main>
  </div>
</template>

<script>
import SearchBar from "./components/SearchBar.vue";
export default {
  name: "AppRoot",
  components: { SearchBar },
  data: () => ({ searchQuery: "" }),
  methods: {
    handleSearch(q) {
      this.searchQuery = q;
    },
  },
};
</script>
