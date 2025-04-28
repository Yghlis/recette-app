<!-- src/views/HomeView.vue -->
<template>
  <div class="home-view">
    <h2>Liste des Recettes</h2>
    <div v-if="loading">Chargement...</div>
    <div v-else>
      <div v-if="recipes.length === 0">Aucune recette trouvée.</div>
      <ul class="recipe-list">
        <li v-for="recipe in recipes" :key="recipe.id">
          <div class="recipe-info">
            <strong>{{ recipe.Name }}</strong> –
            <em>{{ formatDishType(recipe.DishType) }}</em>
          </div>
          <div class="actions">
            <router-link :to="`/recipe/${recipe.id}`">Voir</router-link>
            <router-link :to="`/edit/${recipe.id}`">Modifier</router-link>
            <button @click="deleteRecipe(recipe.id)">Supprimer</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  props: {
    searchQuery: {
      type: String,
      default: "",
    },
  },
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
      } else if (typeof dt === "string" && dt.trim() !== "") {
        return dt;
      } else {
        return "Type de plat non renseigné";
      }
    },
    async fetchRecipes(query = "") {
      this.loading = true;
      try {
        let url = "http://localhost:3000/api/recettes";
        if (query) {
          url = `http://localhost:3000/api/recherche?q=${encodeURIComponent(
            query
          )}`;
        }
        const res = await fetch(url);
        this.recipes = await res.json();
      } catch (error) {
        console.error("Erreur lors du chargement des recettes", error);
      }
      this.loading = false;
    },
    async deleteRecipe(id) {
      if (!confirm("Voulez-vous vraiment supprimer cette recette ?")) return;
      try {
        const res = await fetch(`http://localhost:3000/api/recettes/${id}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (res.ok) {
          alert(result.message);
          // On rafraîchit la liste après suppression
          this.fetchRecipes(this.searchQuery);
        } else {
          alert(result.error);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la recette", error);
        alert("Erreur lors de la suppression");
      }
    },
  },
  watch: {
    searchQuery(newQuery) {
      this.fetchRecipes(newQuery);
    },
  },
  mounted() {
    this.fetchRecipes();
  },
};
</script>

<style scoped>
.recipe-list {
  list-style: none;
  margin: 20px 0;
  padding: 0;
}
.recipe-list li {
  margin: 10px 0;
  padding: 10px;
  background-color: #f7f7f7;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}
.recipe-info {
  margin-bottom: 5px;
}
.actions {
  font-size: 0.9em;
}
.actions a {
  margin-right: 10px;
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
