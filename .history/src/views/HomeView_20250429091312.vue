<template>
  <div class="home-view">
    <h2>Recettes Personnalisées</h2>

    <!-- Barre de recherche -->
    <SearchBar @search="onSearch" />

    <div v-if="loading">Chargement...</div>
    <div v-else>
      <div v-if="recipes.length === 0" class="no-results">
        Aucune recette trouvée.
      </div>
      <ul v-else class="recipe-list">
        <li v-for="recipe in recipes" :key="recipe.id">
          <div class="recipe-info">
            <strong>{{ recipe.Name }}</strong> –
            <em>{{ formatDishType(recipe.DishType) }}</em>
          </div>
          <div class="actions">
            <router-link :to="`/recipe/${recipe.id}`">Voir</router-link>
            <router-link :to="`/edit/${recipe.id}`">Modifier</router-link>
            <button @click="deleteRecipe(recipe.id)">
              Supprimer
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import SearchBar from "@/components/SearchBar.vue";

export default {
  name: "HomeView",
  components: { SearchBar },
  data() {
    return {
      recipes: [],
      loading: false,
    };
  },
  methods: {
    formatDishType(dt) {
      if (Array.isArray(dt)) {
        return dt.join(", ");
      } else if (typeof dt === "string" && dt.trim()) {
        return dt;
      }
      return "Non renseigné";
    },
    // callback appelée par SearchBar
    onSearch(foundRecipes) {
      this.recipes = foundRecipes;
    },
    async fetchAllRecipes() {
      this.loading = true;
      try {
        const res = await fetch("http://localhost:3000/api/recettes");
        this.recipes = await res.json();
      } catch (err) {
        console.error("Erreur chargement recettes :", err);
        this.recipes = [];
      } finally {
        this.loading = false;
      }
    },
    async deleteRecipe(id) {
      if (!confirm("Voulez-vous vraiment supprimer cette recette ?")) return;
      try {
        const res = await fetch(
          `http://localhost:3000/api/recettes/${id}`,
          { method: "DELETE" }
        );
        const result = await res.json();
        if (res.ok) {
          alert(result.message);
          // raffraîchir la liste actuelle
          this.fetchAllRecipes();
        } else {
          alert(result.error);
        }
      } catch (err) {
        console.error("Erreur suppression :", err);
        alert("Échec de la suppression");
      }
    },
  },
  mounted() {
    // au chargement, on affiche toutes les recettes
    this.fetchAllRecipes();
  },
};
</script>

<style scoped>
.home-view {
  padding: 1rem;
}
.no-results {
  margin-top: 1rem;
}
.recipe-list {
  list-style: none;
  margin: 1rem 0;
  padding: 0;
}
.recipe-list li {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f7f7f7;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.recipe-info {
  margin-bottom: 0.5rem;
}
.actions {
  font-size: 0.9rem;
}
.actions a {
  margin-right: 0.75rem;
  color: #42b983;
  text-decoration: none;
}
.actions a.router-link-active {
  font-weight: bold;
}
.actions button {
  border: none;
  background: transparent;
  color: #d9534f;
  cursor: pointer;
}
.actions button:hover {
  text-decoration: underline;
}
</style>
