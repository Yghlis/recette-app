<!-- src/components/SearchBar.vue -->
<template>
  <div class="search-bar">
    <input
      type="text"
      v-model="localQuery"
      placeholder="Rechercher une recette..."
      @keyup.enter="emitSearch"
    />
    <button @click="emitSearch">Rechercher</button>

    <!-- Liste des suggestions -->
    <ul v-if="suggestions.length" class="suggestions">
      <li
        v-for="recipe in suggestions"
        :key="recipe.id"
        @click="selectSuggestion(recipe)"
      >
        {{ recipe.Name }} <small>({{ recipe.DishType }})</small>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "SearchBar",
  data() {
    return {
      localQuery: "",
      suggestions: [],
      // on peut rajouter un flag pour empêcher trop d'appels simultanés
      loading: false,
    };
  },
  watch: {
    // Dès que l'utilisateur tape, on va chercher des suggestions
    localQuery(q) {
      if (!q.trim()) {
        this.suggestions = [];
      } else {
        this.fetchSuggestions();
      }
    },
  },
  methods: {
    async fetchSuggestions() {
      const query = this.localQuery.trim();
      if (!query) return;
      this.loading = true;
      try {
        const params = new URLSearchParams({ q: query });
        const res = await fetch(
          `http://localhost:3000/api/recherche?${params.toString()}`
        );
        if (res.ok) {
          this.suggestions = await res.json();
        } else {
          this.suggestions = [];
        }
      } catch (e) {
        console.error("Recherche échouée :", e);
        this.suggestions = [];
      } finally {
        this.loading = false;
      }
    },
    selectSuggestion(recipe) {
      // 1) on met à jour l'input
      this.localQuery = recipe.Name;
      this.suggestions = [];
      // 2) on émet vers le parent
      this.$emit("search", recipe);
      //    ou navigation directe :
      // this.$router.push(`/recettes/${recipe.id}`);
    },
    emitSearch() {
      if (!this.localQuery.trim()) return;
      // on émet seulement la query brute pour le parent
      this.$emit("search", { Name: this.localQuery.trim() });
      this.suggestions = [];
    },
  },
};
</script>

<style scoped>
.search-bar {
  position: relative;
  max-width: 400px;
}
.search-bar input {
  width: calc(100% - 90px);
  padding: 0.5rem;
}
.search-bar button {
  width: 70px;
  padding: 0.5rem;
  margin-left: 0.5rem;
}
.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 10;
}
.suggestions li {
  padding: 0.5rem;
  cursor: pointer;
}
.suggestions li:hover {
  background: #f5f5f5;
}
</style>
