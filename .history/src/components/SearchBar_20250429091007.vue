<template>
  <div class="search-bar">
    <input
      type="text"
      v-model="localQuery"
      placeholder="Rechercher une recette..."
      @keyup.enter="emitSearch"
      @focus="showSuggestions = true"
    />
    <button :disabled="loading" @click="emitSearch">
      {{ loading ? '…' : 'Rechercher' }}
    </button>

    <ul v-if="suggestions.length && showSuggestions" class="suggestions">
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
      loading: false,
      showSuggestions: false,
    };
  },
  watch: {
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
      const q = this.localQuery.trim();
      if (!q) {
        this.suggestions = [];
        return;
      }
      this.loading = true;
      try {
        const params = new URLSearchParams({ q });
        const res = await fetch(`http://localhost:3000/api/recherche?${params}`);
        this.suggestions = res.ok ? await res.json() : [];
      } catch (e) {
        console.error("Recherche échouée :", e);
        this.suggestions = [];
      } finally {
        this.loading = false;
      }
    },
    selectSuggestion(recipe) {
      this.localQuery = recipe.Name;
      this.showSuggestions = false;
      this.suggestions = [];
      // émet un tableau contenant la recette sélectionnée
      this.$emit("search", [recipe]);
    },
    async emitSearch() {
      const q = this.localQuery.trim();
      if (!q) return;
      this.loading = true;
      this.showSuggestions = false;
      try {
        const params = new URLSearchParams({ q });
        const res = await fetch(`http://localhost:3000/api/recherche?${params}`);
        const results = res.ok ? await res.json() : [];
        this.$emit("search", results);
      } catch (e) {
        console.error("Recherche échouée :", e);
        this.$emit("search", []);
      } finally {
        this.loading = false;
      }
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
  width: calc(100% - 100px);
  padding: 0.5rem;
}
.search-bar button {
  width: 90px;
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
