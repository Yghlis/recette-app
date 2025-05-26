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
      Retour à la liste des ingrédients
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

<style scoped lang="scss">
.ingredient-detail-view {

  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: #2c3e50;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-align: center;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  h3 {
    color: #34495e;
    font-size: 1.4rem;
    margin-bottom: 1.5rem;
    text-align: center;
    font-weight: 500;
  }
  
  p {
    margin: 1rem 0;
    padding: 0.8rem;
    background: rgba(255, 255, 255, 0.8);
    border-left: 4px solid $primary-color;
    border-radius: 6px;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.95);
      transform: translateX(5px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    strong {
      color: $primary-color;
      font-weight: 600;
    }
  }
  
  a {
    display: inline-block;
    margin-top: 2rem;
    padding: 0.8rem 1.5rem;
    background: $primary-color;
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      background: $primary-color;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
