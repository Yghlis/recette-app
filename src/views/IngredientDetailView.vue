<template>
  <div v-if="ingredient" class="ingredient-detail-view">
    <h2>{{ ingredient.Name }}</h2>
    <h3>Valeurs nutritionnelles pour 100 {{ unitRef }}</h3>

    <p><strong>Calories :</strong> {{ ingredient.Calories ?? 0 }} kcal</p>
    <p>
      <strong>Protéines :</strong>
      {{ ingredient.Proteines ?? 0 }} {{ unitRef }}
    </p>
    <p>
      <strong>Glucides :</strong>
      {{ ingredient.Glucides ?? 0 }} {{ unitRef }}
    </p>
    <p>
      <strong>Lipides :</strong>
      {{ ingredient.Lipides ?? 0 }} {{ unitRef }}
    </p>
    <p><strong>Vitamines :</strong> {{ ingredient.Vitamines || "—" }}</p>
    <p><strong>Minéraux :</strong> {{ ingredient.Mineraux || "—" }}</p>

    <router-link to="/ingredients">
      ← Retour à la liste des ingrédients
    </router-link>
  </div>

  <div v-else>Chargement...</div>
</template>

<script>
export default {
  name: "IngredientDetailView",
  data() {
    return {
      ingredient: null,
    };
  },
  computed: {
    unitRef() {
      // Si l'unité est 'mL', on affiche 'mL', sinon on considère 'g' par défaut
      return this.ingredient.Unit === "mL" ? "mL" : "g";
    },
  },
  async created() {
    try {
      const id = this.$route.params.id;
      const resp = await fetch(`http://localhost:3000/api/ingredients/${id}`);
      this.ingredient = await resp.json();
    } catch (e) {
      console.error("Erreur chargement ingrédient:", e);
    }
  },
};
</script>

<style scoped>
.ingredient-detail-view {
  padding: 20px;
  border: 1px solid #ddd;
  background: #fff;
}
.ingredient-detail-view p {
  margin: 8px 0;
}
</style>
