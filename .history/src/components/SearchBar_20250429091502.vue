<!-- src/components/SearchBar.vue -->
<template>
  <div class="search-bar">
    <!-- 1) Boutons de filtre multi-select -->
    <div class="type-filters">
      <button
        v-for="t in types"
        :key="t"
        :class="{ active: selectedTypes.includes(t) }"
        @click="toggleType(t)"
      >
        {{ t }}
      </button>
      <button
        v-if="selectedTypes.length"
        class="clear"
        title="Tout effacer"
        @click="clearTypes"
      >
        ✕
      </button>
    </div>

    <!-- 2) Input + bouton -->
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

    <!-- 3) Suggestions -->
    <ul v-if="suggestions.length && showSuggestions" class="suggestions">
      <li
        v-for="r in suggestions"
        :key="r.id"
        @click="selectSuggestion(r)"
      >
        {{ r.Name }} <small>({{ r.DishType }})</small>
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
      types: ["Entrée", "Plat", "Dessert", "Autre"],
      selectedTypes: [],
      suggestions: [],
      loading: false,
      showSuggestions: false,
    };
  },
  watch: {
    // relance auto-complétion à chaque frappe ou changement de filtres
    localQuery() {
      this.fetchSuggestions();
    },
    selectedTypes() {
      this.fetchSuggestions();
    },
  },
  methods: {
    toggleType(type) {
      const idx = this.selectedTypes.indexOf(type);
      if (idx === -1) {
        this.selectedTypes.push(type);
      } else {
        this.selectedTypes.splice(idx, 1);
      }
    },
    clearTypes() {
      this.selectedTypes = [];
    },

    async fetchSuggestions() {
      const q = this.localQuery.trim();
      // si tout est vide, on ne montre ni suggestion ni appel réseau
      if (!q && this.selectedTypes.length === 0) {
        this.suggestions = [];
        this.showSuggestions = false;
        return;
      }

      this.loading = true;
      try {
        const params = new URLSearchParams();
        if (q) params.append("q", q);
        // un param type=<t> par filtre
        this.selectedTypes.forEach(t => params.append("type", t));

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
      this.$emit("search", [recipe]);
    },

    async emitSearch() {
      const q = this.localQuery.trim();
      if (!q && this.selectedTypes.length === 0) return;

      this.loading = true;
      this.showSuggestions = false;
      try {
        const params = new URLSearchParams();
        if (q) params.append("q", q);
        this.selectedTypes.forEach(t => params.append("type", t));

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

/* 1) filtres orange */
.type-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.type-filters button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #f6931e;
  background: white;
  color: #f6931e;
  border-radius: 3px;
  cursor: pointer;
  transition: background .2s, color .2s;
}
.type-filters button.active {
  background: #f6931e;
  color: white;
}
.type-filters button.clear {
  background: transparent;
  border: none;
  color: #666;
  font-weight: bold;
}

/* 2) input + bouton */
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
  background: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}

/* 3) suggestions */
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
