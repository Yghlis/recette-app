<template>
  <div v-if="recipe" class="recipe-detail-view">
    <h2>{{ recipe.Name }}</h2>

    <p><strong>Instructions :</strong> {{ recipe.Instructions || "—" }}</p>

    <p>
      <strong>Nombre de personnes :</strong>
      {{ servings }}
    </p>

    <p>
      <strong>Intolérances :</strong>
      {{ safeJoin(recipe.Intolerances) || "—" }}
    </p>

    <p>
      <strong>Type de plat :</strong>
      {{ safeJoin(recipe.DishType) || "—" }}
    </p>

    <h3>Ingrédients</h3>
    <ul v-if="hasIngredients">
      <li v-for="(ing, i) in recipe.IngredientsDetails" :key="i">
        {{ ing.Nom }} — {{ ing.Quantite }} {{ ing.Unite }}
      </li>
    </ul>
    <p v-else>Aucun ingrédient renseigné.</p>

    <!-- SECTION NUTRITION -->
    <h3>Valeurs nutritionnelles</h3>
    <ul class="nutrition-list">
      <li><strong>Calories :</strong> {{ recipe.CaloriesTotal }} kcal</li>
      <li><strong>Protéines :</strong> {{ recipe.ProteinesTotal }} g</li>
      <li><strong>Glucides :</strong> {{ recipe.GlucidesTotal }} g</li>
      <li><strong>Lipides :</strong> {{ recipe.LipidesTotal }} g</li>
    </ul>
    <p><strong>Vitamines :</strong> {{ recipe.Vitamines || "—" }}</p>
    <p><strong>Minéraux :</strong> {{ recipe.Mineraux || "—" }}</p>

    <router-link :to="`/edit/${recipe.id}`">Modifier cette recette</router-link>
  </div>

  <p v-else>Chargement…</p>
</template>

<script>
export default {
  name: "RecipeDetailView",
  data: () => ({ recipe: null }),
  computed: {
    servings() {
      return (
        this.recipe?.Servings ?? this.recipe?.["Nombre de personnes"] ?? "—"
      );
    },
    hasIngredients() {
      return (
        this.recipe?.IngredientsDetails &&
        this.recipe.IngredientsDetails.length > 0
      );
    },
  },
  methods: {
    safeJoin(val) {
      if (!val) return "";
      return Array.isArray(val) ? val.join(", ") : val;
    },
    async loadRecipe() {
      try {
        const id = this.$route.params.id;
        const r = await fetch(`http://localhost:3000/api/recettes/${id}`);
        this.recipe = await r.json();
      } catch (e) {
        console.error("Chargement recette :", e);
      }
    },
  },
  created() {
    this.loadRecipe();
  },
};
</script>

<style scoped>
.recipe-detail-view {
  line-height: 1.6;
  padding: 20px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
}
.recipe-detail-view ul {
  list-style: none;
  padding: 0;
}
.recipe-detail-view li {
  background: #f7f7f7;
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 4px;
}
/* Styles pour la liste nutritionnelle */
.nutrition-list {
  list-style: none;
  padding: 0;
  margin-bottom: 15px;
}
.nutrition-list li {
  margin-bottom: 4px;
}
</style>
