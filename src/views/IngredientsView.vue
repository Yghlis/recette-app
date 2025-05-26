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

<style scoped lang="scss">
.ingredients-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;

  h2 {
    color: #333;
    margin-bottom: 30px;
    font-size: 2rem;
  }

  .ingredient-list {
    list-style: none;
    margin: 20px 0;
    padding: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;

    li {
      padding: 15px 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #f8f9fa;
      }

      &:last-child {
        border-bottom: none;
      }

      strong {
        color: #2c3e50;
        font-size: 1.1rem;
      }
    }
  }

  .actions {
    font-size: 0.9em;
    display: flex;
    gap: 8px;

    a {
      color: #007bff;
      text-decoration: none;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #e7f3ff;
        text-decoration: none;
      }
    }

    button {
      border: none;
      background: transparent;
      color: #dc3545;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #f8d7da;
        text-decoration: underline;
      }
    }
  }

  > a {
    display: inline-block;
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #218838;
    }
  }
}
</style>
