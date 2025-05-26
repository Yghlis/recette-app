<!-- src/components/SearchBar.vue -->
<template>
  <div class="search-bar">
    <!-- Filtres par type de plat -->
    <div class="type-filters">
      <button
        v-for="t in types"
        :key="t"
        :class="{ active: selectedType === t }"
        @click="toggleType(t)"
      >
        {{ t }}
      </button>
      <button
        v-if="selectedType"
        class="clear"
        title="Tout afficher"
        @click="clearType"
      >
        ✕
      </button>
    </div>

    <!-- Input + bouton -->
    <div class="input-group">
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
    </div>

    <!-- Suggestions -->
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
      selectedType: "",       // type filtré
      types: ["Entrée", "Plat", "Dessert", "Autre"],
      suggestions: [],
      loading: false,
      showSuggestions: false,
    };
  },
  watch: {
    // dès que la saisie ou le filtre type change, on met à jour les suggestions
    localQuery() {
      this.fetchSuggestions();
    },
    selectedType() {
      this.fetchSuggestions();
    }
  },
  methods: {
    // clique sur un type : active/désactive
    toggleType(type) {
      this.selectedType = this.selectedType === type ? "" : type;
    },
    clearType() {
      this.selectedType = "";
    },

    // récupère autocomplete via /api/recherche?q=…&type=…
    async fetchSuggestions() {
      const q = this.localQuery.trim();
      // on n'affiche pas de liste vide si tout est vide
      if (!q && !this.selectedType) {
        this.suggestions = [];
        this.showSuggestions = false;
        return;
      }

      this.loading = true;
      try {
        const params = new URLSearchParams();
        if (q)             params.append("q", q);
        if (this.selectedType) params.append("type", this.selectedType);

        const res = await fetch(
          `http://localhost:3000/api/recherche?${params.toString()}`
        );
        this.suggestions = res.ok ? await res.json() : [];
        this.showSuggestions = true;
      } catch (e) {
        console.error("Recherche échouée :", e);
        this.suggestions = [];
        this.showSuggestions = false;
      } finally {
        this.loading = false;
      }
    },

    selectSuggestion(recipe) {
      this.localQuery = recipe.Name;
      this.showSuggestions = false;
      this.suggestions = [];
      // on émet l'ensemble des résultats sous forme de tableau
      this.$emit("search", [recipe]);
    },

    // clique sur "Rechercher" ou Enter
    async emitSearch() {
      const q = this.localQuery.trim();
      // si ni texte ni filtre, on ne fait rien
      if (!q && !this.selectedType) return;

      this.loading = true;
      this.showSuggestions = false;
      try {
        const params = new URLSearchParams();
        if (q)             params.append("q", q);
        if (this.selectedType) params.append("type", this.selectedType);

        const res = await fetch(
          `http://localhost:3000/api/recherche?${params.toString()}`
        );
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
  max-width: 600px;
}

/* boutons de type */
.type-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.type-filters button {
  padding: 0.3rem 0.6rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 3px;
}
.type-filters button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}
.type-filters button.clear {
  background: transparent;
  border: none;
  color: #666;
  font-weight: bold;
  cursor: pointer;
}

/* input + bouton */
.input-group {
  display: flex;
}
.input-group input {
  flex: 1;
  padding: 0.5rem;
}
.input-group button {
  padding: 0.5rem 1rem;
  margin-left: 0.5rem;
}

/* suggestions */
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
