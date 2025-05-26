<template>
  <div class="recipe-form-view">
    <h2>{{ isEdit ? "Modifier la recette" : "Créer une recette" }}</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Nom :</label>
        <input v-model="formData.Name" :disabled="loading" required />
      </div>

      <div class="form-group">
        <label>Instructions :</label>
        <textarea
          v-model="formData.Instructions"
          :disabled="loading"
          rows="4"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Nombre de personnes :</label>
        <input
          type="number"
          v-model.number="formData.Servings"
          required
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label>Intolérances (séparées par une virgule) :</label>
        <input
          v-model="intolerancesInput"
          placeholder="Exemple : Lactose, Gluten"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label>Type de plat :</label>
        <select v-model="formData.DishType" required :disabled="loading">
          <option value="" disabled>Choisir un type de plat</option>
          <option v-for="type in types" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
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
            :disabled="loading"
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
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label>Unité :</label>
          <select v-model="ing.Unite" required :disabled="loading">
            <option value="" disabled>Choisir une unité</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="mL">mL</option>
            <option value="L">L</option>
            <option value="cuillere">cuillère à soupe</option>
            <option value="piece">pièce</option>
            <option value="pinces">pincée</option>
          </select>
        </div>

        <button type="button" @click="removeIngredient(index)">
          Supprimer cet ingrédient
        </button>
      </div>

      <button v-if="!loading" type="button" @click="addIngredient">
        Ajouter un ingrédient
      </button>
      <button :disabled="loading" type="submit">
        {{ isEdit ? "Mettre à jour" : "Créer" }}
      </button>
      <span v-if="loading" class="spinner"></span>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(false);

const isEdit = ref(false);
const formData = reactive({
  Name: "",
  Instructions: "",
  Servings: 1,
  Intolerances: "",
  DishType: "",
});
const intolerancesInput = ref("");
const types = ["Entrée", "Plat", "Dessert", "Autre"];
const ingredientsDetails = ref([
  { Nom: "", Quantite: 1, Unite: "", suggestions: [] },
]);
const allIngredients = ref([]);

const addIngredient = () => {
  ingredientsDetails.value.push({
    Nom: "",
    Quantite: 1,
    Unite: "",
    suggestions: [],
  });
};

const removeIngredient = (i) => {
  ingredientsDetails.value.splice(i, 1);
};

const updateIngredientSuggestions = (i) => {
  const v = ingredientsDetails.value[i].Nom.trim().toLowerCase();
  ingredientsDetails.value[i].suggestions = v
    ? allIngredients.value.filter((ing) => ing.Name.toLowerCase().startsWith(v))
    : [];
};

const selectIngredientSuggestion = (i, s) => {
  ingredientsDetails.value[i].Nom = s.Name;
  ingredientsDetails.value[i].suggestions = [];
};

const handleSubmit = async () => {
  if (loading.value) return;
  loading.value = true;
  formData.Intolerances = intolerancesInput.value.trim();

  const ingredients = ingredientsDetails.value.filter(
    (i) => i.Nom && i.Nom.trim()
  );
  if (!ingredients.length) {
    return alert("Veuillez renseigner au moins un ingrédient.");
  }

  const payload = {
    ...formData,
    IngredientsDetails: ingredients,
  };

  let url = "http://localhost:3000/api/recettes";
  let method = "POST";
  if (isEdit.value) {
    url = `http://localhost:3000/api/recettes/${route.params.id}`;
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
    loading.value = false;
    toast.success(
      isEdit.value
        ? "Recette mise à jour avec succès !"
        : "Recette créée avec succès !"
    );
    router.push("/");
  } catch (e) {
    console.error(e);
    loading.value = false;
    toast.error(e.message || "Erreur lors de l'envoi de la recette.");
  }
};

onMounted(async () => {
  try {
    const r = await fetch("http://localhost:3000/api/ingredients");
    allIngredients.value = await r.json();
  } catch (e) {
    console.error("Autocomplete ingredients :", e);
  }

  const id = route.params.id;
  if (!id) return;
  isEdit.value = true;

  try {
    const r = await fetch(`http://localhost:3000/api/recettes/${id}`);
    const d = await r.json();

    Object.assign(formData, {
      ...formData,
      ...d,
      Servings: d.Servings ?? formData.Servings,
      DishType:
        typeof d.DishType === "string"
          ? d.DishType
          : (d.DishType || "").toString(),
    });
    intolerancesInput.value = d.Intolerances || "";

    if (d.IngredientsDetails?.length) {
      ingredientsDetails.value = d.IngredientsDetails.map((ing) => ({
        ...ing,
        suggestions: [],
      }));
    }
  } catch (e) {
    console.error("Chargement recette :", e);
  }
});
</script>

<style scoped lang="scss">
.recipe-form-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h2 {
    color: #2c3e50;
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    text-align: center;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  h3 {
    color: #34495e;
    font-size: 1.3rem;
    margin: 2rem 0 1.5rem 0;
    text-align: center;
    font-weight: 500;
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-size: 1rem;
    }

    input,
    textarea,
    select {
      width: 100%;
      padding: 0.8rem;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      font-size: 1rem;
      background: rgba(255, 255, 255, 0.9);
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: $primary-color;
        box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
        background: white;
      }

      &:disabled {
        background: #f8f9fa;
        opacity: 0.7;
      }
    }

    input[type="number"] {
      width: 100%;
    }
  }

  button {
    padding: 1rem 1.5rem;
    background: $primary-color;
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      background-color: lighten($primary-color, 10%);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    &[type="submit"] {
      width: 100%;
    }
  }

  .ingredient-detail {
    border: 2px solid #dee2e6;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 12px;
    position: relative;
    background: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    button {
      width: auto;
      background: #e74c3c;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;

      &:hover {
        background: lighten(#e74c3c, 10%);
      }
    }
  }

  .suggestions {
    list-style: none;
    padding: 0;
    margin: 0;
    border: 2px solid #dee2e6;
    background: white;
    position: absolute;
    z-index: 10;
    left: 0;
    right: 0;
    max-height: 150px;
    overflow-y: auto;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    li {
      padding: 0.8rem;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: #f8f9fa;
      }

      &:not(:last-child) {
        border-bottom: 1px solid #dee2e6;
      }
    }
  }
}
.spinner {
  display: block;
  border: 2px solid #f3f3f3;
  border-top: 2px solid $primary-color;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  margin: 25px auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
