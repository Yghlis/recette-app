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
    };
  },
  watch: {
    localQuery(q) {
      if (!q.trim()) {
        this.suggestions = [];
      } else {
        this.fetchSuggestions(q.trim());
      }
    },
  },
  methods: {
    async fetchSuggestions(query) {
      try {
        const res = await fetch(
          `http://localhost:3000/api/recherche?q=${encodeURIComponent(query)}`
        );
        this.suggestions = res.ok ? await res.json() : [];
      } catch (e) {
        console.error("Recherche échouée :", e);
        this.suggestions = [];
      }
    },
    selectSuggestion(recipe) {
      // 1) on met à jour l'input
      this.localQuery = recipe.Name;
      this.suggestions = [];
      // 2) on émet vers le parent
      this.$emit("search", recipe);
      // -- ou, si vous préférez naviguer directement : --
      // this.$router.push(`/recettes/${recipe.id}`);
    },
    emitSearch() {
      if (!this.localQuery.trim()) return;
      this.$emit("search", { Name: this.localQuery.trim() });
      this.suggestions = [];
    },
  },
};
</script>

<style scoped>
/* identique à ce que tu avais */
</style>
