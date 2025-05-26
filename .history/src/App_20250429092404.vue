<!-- src/App.vue -->
<template>
  <div id="app">
    <header class="app-header">
      <h1>Recettes Personnalisées</h1>

      <!-- 1) Barre de recherche ici, juste en dessous du titre -->
      <SearchBar @search="handleSearch" />

      <nav class="nav-bar">
        <router-link to="/">Accueil</router-link>
        <router-link to="/create">Créer une recette</router-link>
        <router-link to="/ingredients">Gérer Ingrédients</router-link>
        <router-link to="/generate">Générer une recette</router-link>
      </nav>
    </header>

    <main class="app-main">
      <!-- 2) On passe la query à la view courante -->
      <router-view :search-query="searchQuery" />
    </main>
  </div>
</template>

<script>
import SearchBar from "./components/SearchBar.vue";

export default {
  name: "AppRoot",
  components: { SearchBar },
  data: () => ({
    searchQuery: ""  // contient le texte (ou les filtres) émis par SearchBar
  }),
  methods: {
    handleSearch(payload) {
      // payload est soit une chaîne, soit un tableau d'objets {Name, DishType, ...}
      // ici on veut juste passer la string pour fetch dans HomeView
      if (typeof payload === "string") {
        this.searchQuery = payload;
      } else if (Array.isArray(payload) && payload.length > 0) {
        // si SearchBar émet le tableau de recettes, on peut l'ignorer
        // ou transmettre une string construite, par ex. le premier Name
        this.searchQuery = payload[0].Name;
      } else {
        this.searchQuery = "";
      }
    },
  },
};
</script>

<style>
/* ton style existant… */
</style>
