<template>
  <div class="recipe-form-view">
    <h2>{{ isEdit ? "Modifier la recette" : "Créer une recette" }}</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Nom :</label>
        <input v-model="formData.Name" required />
      </div>

      <div class="form-group">
        <label>Instructions :</label>
        <textarea v-model="formData.Instructions" rows="4"></textarea>
      </div>

      <div class="form-group">
        <label>Nombre de personnes :</label>
        <input type="number" v-model.number="formData.Servings" required />
      </div>

      <div class="form-group">
        <label>Intolérances (séparées par une virgule) :</label>
        <input
          v-model="intolerancesInput"
          placeholder="Exemple : Lactose, Gluten"
        />
      </div>

      <div class="form-group">
        <label>Type de plat :</label>
        <input v-model="dishTypeInput" placeholder="Exemple : Plat, Dessert" />
      </div>

      <h3>Ingrédients</h3>
      <div
        v-for="(ing, index) in ingredientsDetails"
        :key="index"
        class="ingredient-detail"
      >
        <div class="form-group">
          <label>Nom de l'ingrédient :</label>
          <input
            v-model="ing.Nom"
            placeholder="Ex : Carottes"
            @input="updateIngredientSuggestions(index)"
            required
          />
          <ul
            v-if="ing.suggestions && ing.suggestions.length"
            class="suggestions"
          >
            <li
              v-for="(s, sIndex) in ing.suggestions"
              :key="sIndex"
              @click="selectIngredientSuggestion(index, s)"
            >
              {{ s.Name }}
            </li>
          </ul>
        </div>

        <div class="form-group">
          <label>Quantité :</label>
          <input
            type="number"
            v-model.number="ing.Quantite"
            placeholder="Ex : 200"
          />
        </div>

        <div class="form-group">
          <label>Unité :</label>
          <select v-model="ing.Unite" required>
            <option value="" disabled>Choisir une unité</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="mL">mL</option>
            <option value="L">L</option>
            <option value="cuillere">cuillère à soupe</option>
            <option value="pinces">pincée</option>
          </select>
        </div>

        <button type="button" @click="removeIngredient(index)">
          Supprimer cet ingrédient
        </button>
        <hr />
      </div>

      <button type="button" @click="addIngredient">
        Ajouter un ingrédient
      </button>
      <button type="submit">{{ isEdit ? "Mettre à jour" : "Créer" }}</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "RecipeFormView",
  data() {
    return {
      isEdit: false,
      formData: {
        Name: "",
        Instructions: "",
        Servings: 1,
        Intolerances: "",
        DishType: "",
      },
      intolerancesInput: "",
      dishTypeInput: "",
      ingredientsDetails: [
        { Nom: "", Quantite: 1, Unite: "", suggestions: [] },
      ],
      allIngredients: [],
    };
  },
  async created() {
    try {
      const r = await fetch("http://localhost:3000/api/ingredients");
      this.allIngredients = await r.json();
    } catch (e) {
      console.error("Autocomplete ingredients :", e);
    }

    const id = this.$route.params.id;
    if (!id) return;
    this.isEdit = true;

    try {
      const r = await fetch(`http://localhost:3000/api/recettes/${id}`);
      const d = await r.json();

      const servings =
        d.Servings ?? d["Nombre de personnes"] ?? this.formData.Servings;

      this.formData = {
        ...this.formData,
        ...d,
        Servings: servings,
        DishType:
          typeof d.DishType === "string"
            ? d.DishType
            : (d.DishType || "").toString(),
      };
      this.intolerancesInput = d.Intolerances || "";
      this.dishTypeInput = this.formData.DishType;

      if (d.IngredientsDetails?.length) {
        this.ingredientsDetails = d.IngredientsDetails.map((ing) => ({
          ...ing,
          suggestions: [],
        }));
      }
    } catch (e) {
      console.error("Chargement recette :", e);
    }
  },
  methods: {
    addIngredient() {
      this.ingredientsDetails.push({
        Nom: "",
        Quantite: 1,
        Unite: "",
        suggestions: [],
      });
    },
    removeIngredient(i) {
      this.ingredientsDetails.splice(i, 1);
    },
    updateIngredientSuggestions(i) {
      const v = this.ingredientsDetails[i].Nom.trim().toLowerCase();
      this.ingredientsDetails[i].suggestions = v
        ? this.allIngredients.filter((ing) =>
            ing.Name.toLowerCase().startsWith(v)
          )
        : [];
    },
    selectIngredientSuggestion(i, s) {
      this.ingredientsDetails[i].Nom = s.Name;
      this.ingredientsDetails[i].suggestions = [];
    },
    async handleSubmit() {
      this.formData.Intolerances = this.intolerancesInput.trim();
      this.formData.DishType = this.dishTypeInput.trim();

      const ingredients = this.ingredientsDetails.filter(
        (i) => i.Nom && i.Nom.trim()
      );
      if (!ingredients.length) {
        return alert("Veuillez renseigner au moins un ingrédient.");
      }

      const payload = {
        ...this.formData,
        IngredientsDetails: ingredients,
      };

      let url = "http://localhost:3000/api/recettes";
      let method = "POST";
      if (this.isEdit) {
        url = `http://localhost:3000/api/recettes/${this.$route.params.id}`;
        method = "PUT";
      }

      try {
        const r = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || "Erreur lors de l'envoi.");
        }
        alert(this.isEdit ? "Recette mise à jour !" : "Recette créée !");
        this.$router.push("/");
      } catch (e) {
        console.error(e);
        alert(e.message);
      }
    },
  },
};
</script>

<style scoped>
.recipe-form-view {
  max-width: 600px;
  margin: 0 auto;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input,
textarea,
select {
  width: 100%;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
}
button {
  margin-top: 10px;
  padding: 8px 15px;
  cursor: pointer;
  background-color: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
}
button:hover {
  background-color: #36a173;
}
.ingredient-detail {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  position: relative;
}
.suggestions {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  background: #fff;
  position: absolute;
  z-index: 10;
  left: 0;
  right: 0;
  max-height: 150px;
  overflow-y: auto;
}
.suggestions li {
  padding: 8px;
  cursor: pointer;
}
.suggestions li:hover {
  background: #f2f2f2;
}
</style>
