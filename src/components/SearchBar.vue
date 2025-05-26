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
        {{ loading ? "…" : "Rechercher" }}
      </button>
    </div>

    <!-- 3) Suggestions -->
    <ul v-if="suggestions.length && showSuggestions" class="suggestions">
      <li v-for="r in suggestions" :key="r.id" @click="selectSuggestion(r)">
        {{ r.Name }} <small>({{ r.DishType }})</small>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits } from "vue";

// Props/Emits
const emit = defineEmits(["search"]);

// Reactive data
const localQuery = ref("");
const types = ref(["Entrée", "Plat", "Dessert", "Autre"]);
const selectedTypes = ref([]);
const suggestions = ref([]);
const loading = ref(false);
const showSuggestions = ref(false);

// Watchers
watch(localQuery, () => {
  fetchSuggestions();
});

watch(
  selectedTypes,
  () => {
    fetchSuggestions();
  },
  { deep: true }
);

// Methods
const toggleType = (type) => {
  const idx = selectedTypes.value.indexOf(type);
  if (idx === -1) {
    selectedTypes.value.push(type);
  } else {
    selectedTypes.value.splice(idx, 1);
  }
};

const clearTypes = () => {
  selectedTypes.value = [];
};

const fetchSuggestions = async () => {
  const q = localQuery.value.trim();
  // si tout est vide, on ne montre ni suggestion ni appel réseau
  if (!q && selectedTypes.value.length === 0) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    // un param type=<t> par filtre
    selectedTypes.value.forEach((t) => params.append("type", t));

    const res = await fetch(
      `http://localhost:3000/api/recherche?${params.toString()}`
    );
    suggestions.value = res.ok ? await res.json() : [];
    showSuggestions.value = true;
  } catch (e) {
    console.error("Recherche échouée :", e);
    suggestions.value = [];
    showSuggestions.value = false;
  } finally {
    loading.value = false;
  }
};

const selectSuggestion = (recipe) => {
  localQuery.value = recipe.Name;
  showSuggestions.value = false;
  suggestions.value = [];
  emit("search", [recipe]);
};

const emitSearch = async () => {
  const q = localQuery.value.trim();
  if (!q && selectedTypes.value.length === 0) return;

  loading.value = true;
  showSuggestions.value = false;
  try {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    selectedTypes.value.forEach((t) => params.append("type", t));

    const res = await fetch(
      `http://localhost:3000/api/recherche?${params.toString()}`
    );
    const results = res.ok ? await res.json() : [];
    emit("search", results);
  } catch (e) {
    console.error("Recherche échouée :", e);
    emit("search", []);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.search-bar {
  position: relative;
  max-width: 600px;
}

/* 1) filtres orange */
.type-filters {
  display: flex;
  gap: 0.5rem;
  margin: 20px 0 10px 0;
}
.type-filters button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #f6931e;
  background: white;
  color: #f6931e;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #f6931e;
    color: white;
  }
}
.type-filters button.active {
  background: #f6931e;
  color: white;
}

.type-filters button.clear {
  background: transparent;
  border: none;
  color: #707070;
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
