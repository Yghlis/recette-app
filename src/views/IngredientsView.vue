<!-- src/views/IngredientsView.vue -->
<template>
  <div class="ingredients-view">
    <h2>Liste des Ingrédients</h2>

    <div v-if="loading">Chargement…</div>

    <template v-else>
      <div v-if="ingredients.length === 0">Aucun ingrédient trouvé.</div>

      <ul v-else class="ingredient-list">
        <li v-for="ing in ingredients" :key="ing.id">
          <strong>{{ ing.Name }}</strong>

          <span class="actions">
            <router-link :to="`/ingredient/${ing.id}`">Détail</router-link> |
            <router-link :to="`/ingredient/edit/${ing.id}`"
              >Modifier</router-link
            >
            |
            <button @click="deleteIngredient(ing.id)">Supprimer</button>
          </span>
        </li>
      </ul>

      <router-link to="/ingredient/create">Ajouter un ingrédient</router-link>
    </template>
  </div>
</template>

<script>
export default {
  name: "IngredientsView",
  data: () => ({ ingredients: [], loading: false }),
  methods: {
    async fetchIngredients() {
      this.loading = true;
      try {
        const r = await fetch("http://localhost:3000/api/ingredients");
        this.ingredients = await r.json();
      } catch (e) {
        console.error("Chargement ingrédients :", e);
      } finally {
        this.loading = false;
      }
    },
    async deleteIngredient(id) {
      if (!confirm("Supprimer cet ingrédient ?")) return;
      try {
        const r = await fetch(`http://localhost:3000/api/ingredients/${id}`, {
          method: "DELETE",
        });
        const res = await r.json();
        if (!r.ok) throw new Error(res.error);
        alert(res.message);
        this.fetchIngredients();
      } catch (e) {
        alert(e.message || "Erreur suppression");
      }
    },
  },
  mounted() {
    this.fetchIngredients();
  },
};
</script>

<style scoped>
.ingredient-list {
  list-style: none;
  margin: 20px 0;
  padding: 0;
}
.ingredient-list li {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.actions {
  font-size: 0.9em;
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
