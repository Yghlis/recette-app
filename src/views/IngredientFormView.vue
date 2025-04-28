<template>
  <div class="ingredient-form-view">
    <h2>{{ isEdit ? "Modifier l'ingrédient" : "Créer un ingrédient" }}</h2>

    <form @submit.prevent="handleSubmit">
      <!-- Name -->
      <div class="form-group">
        <label for="name">Nom :</label>
        <input
          id="name"
          v-model="formData.Name"
          required
          @blur="maybeFetchNutrition"
        />
      </div>

      <!-- AI Toggle -->
      <div class="form-group">
        <label for="use-ai">
          <input
            id="use-ai"
            type="checkbox"
            v-model="useAI"
            @change="onToggleAI"
          />
          Utiliser l’IA pour remplir les données nutritionnelles
        </label>
      </div>

      <!-- Unit Selection -->
      <div class="form-group">
        <label for="unit">Unité de référence :</label>
        <select id="unit" v-model="formData.Unit" :disabled="useAI" required>
          <option value="" disabled>Choisir une unité</option>
          <option value="g">g</option>
          <option value="mL">mL</option>
          <option value="piece">pièce</option>
        </select>
      </div>

      <h3>
        Valeurs nutritionnelles pour 100 <span>{{ formData.Unit || "g" }}</span>
      </h3>

      <!-- Nutrition fields -->
      <div class="form-group">
        <label>Calories (kcal) :</label>
        <input
          type="number"
          step="0.01"
          inputmode="decimal"
          v-model.number="formData.Calories"
          :disabled="useAI && loadingNutrition"
          required
        />
      </div>
      <div class="form-group">
        <label>Protéines (g) :</label>
        <input
          type="number"
          step="0.01"
          inputmode="decimal"
          v-model.number="formData.Proteines"
          :disabled="useAI && loadingNutrition"
          required
        />
      </div>
      <div class="form-group">
        <label>Glucides (g) :</label>
        <input
          type="number"
          step="0.01"
          inputmode="decimal"
          v-model.number="formData.Glucides"
          :disabled="useAI && loadingNutrition"
          required
        />
      </div>
      <div class="form-group">
        <label>Lipides (g) :</label>
        <input
          type="number"
          step="0.01"
          inputmode="decimal"
          v-model.number="formData.Lipides"
          :disabled="useAI && loadingNutrition"
          required
        />
      </div>
      <div class="form-group">
        <label>Vitamines :</label>
        <input
          v-model="formData.Vitamines"
          :disabled="useAI && loadingNutrition"
          placeholder="Ex : A, C, K"
        />
      </div>
      <div class="form-group">
        <label>Minéraux :</label>
        <input
          v-model="formData.Mineraux"
          :disabled="useAI && loadingNutrition"
          placeholder="Ex : Calcium, Fer"
        />
      </div>

      <!-- Submit -->
      <button type="submit" :disabled="loadingNutrition">
        {{ isEdit ? "Mettre à jour" : "Créer" }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: "IngredientFormView",
  data() {
    return {
      isEdit: false,
      useAI: false,
      loadingNutrition: false,
      formData: {
        Name: "",
        Unit: "", // ajout du champ Unit
        Calories: 0,
        Proteines: 0,
        Glucides: 0,
        Lipides: 0,
        Vitamines: "",
        Mineraux: "",
      },
    };
  },
  async created() {
    const id = this.$route.params.id;
    if (id) {
      this.isEdit = true;
      try {
        const res = await fetch(`http://localhost:3000/api/ingredients/${id}`);
        this.formData = await res.json();
      } catch (e) {
        console.error("Chargement ingrédient :", e);
      }
    }
  },
  methods: {
    async onToggleAI() {
      if (this.useAI && this.formData.Name.trim()) {
        await this.fetchNutrition();
      }
    },
    async maybeFetchNutrition() {
      if (this.useAI) {
        await this.fetchNutrition();
      }
    },
    async fetchNutrition() {
      this.loadingNutrition = true;
      try {
        const name = encodeURIComponent(this.formData.Name.trim());
        const res = await fetch(
          `http://localhost:3000/api/ingredients/nutrition?name=${name}`
        );
        if (!res.ok) throw new Error("Impossible de récupérer la nutrition");
        const data = await res.json();
        // merge nutritionnelles et unité
        Object.assign(this.formData, data);
      } catch (err) {
        console.error("Nutrition IA error:", err);
        alert("Erreur lors de la récupération des données nutritionnelles");
      } finally {
        this.loadingNutrition = false;
      }
    },
    async handleSubmit() {
      try {
        const payload = { ...this.formData };
        const id = this.$route.params.id;
        const url = id
          ? `http://localhost:3000/api/ingredients/${id}`
          : "http://localhost:3000/api/ingredients";
        const method = id ? "PUT" : "POST";

        const r = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await r.json();
        if (!r.ok) throw new Error(result.error || "Erreur serveur");

        alert(id ? "Ingrédient mis à jour !" : "Ingrédient créé !");
        this.$router.push("/ingredients");
      } catch (e) {
        alert(e.message);
      }
    },
  },
};
</script>

<style scoped>
.ingredient-form-view {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  border-radius: 5px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
input,
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  background-color: #36a173;
}
</style>
