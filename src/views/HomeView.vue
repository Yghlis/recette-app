<template>
  <div class="home-view">
    <h2>Recettes Personnalisées</h2>

    <SearchBar @search="onSearch" />

    <div v-if="loading">Chargement...</div>
    <div v-else>
      <div v-if="recipes.length === 0" class="no-results">
        Aucune recette trouvée.
      </div>
      <ul v-else class="recipe-list">
        <li v-for="r in recipes" :key="r.id">
          <strong>{{ r.Name }}</strong> –
          <em>{{ formatDishType(r.DishType) }}</em>
          <div class="actions">
            <router-link :to="`/recipe/${r.id}`">Voir</router-link>
            <router-link :to="`/edit/${r.id}`">Modifier</router-link>
            <button @click="deleteRecipe(r.id)">Supprimer</button>
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
      return Array.isArray(dt) ? dt.join(", ") : dt || "Non renseigné";
    },
    // réception des résultats de SearchBar
    onSearch(foundRecipes) {
      this.recipes = foundRecipes;
    },
    async deleteRecipe(id) {
      if (!confirm("Supprimer cette recette ?")) return;
      try {
        const res = await fetch(`http://localhost:3000/api/recettes/${id}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (res.ok) {
          alert(json.message);
          // on rafraîchit la page ou la liste
          this.recipes = this.recipes.filter((r) => r.id !== id);
        } else {
          alert(json.error);
        }
      } catch (e) {
        console.error(e);
        alert("Erreur lors de la suppression");
      }
    },
  },
  mounted() {
    // on charge toutes les recettes par défaut (quand SearchBar n'a rien tapé)
    this.loading = true;
    fetch("http://localhost:3000/api/recettes")
      .then((r) => r.json())
      .then((data) => (this.recipes = data))
      .catch(console.error)
      .finally(() => (this.loading = false));
  },
};
</script>

<style scoped lang="scss">
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
