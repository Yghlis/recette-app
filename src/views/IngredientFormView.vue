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
          :disabled="loading"
        />
      </div>

      <!-- AI Toggle -->
      <div class="form-group" v-if="formData.Name.trim()">
        <label for="use-ai">
          <input
            id="use-ai"
            type="checkbox"
            v-model="useAI"
            @change="onToggleAI"
            :disabled="loading"
          />
          Utiliser l’IA pour remplir les données nutritionnelles
        </label>
      </div>

      <!-- Unit Selection -->
      <div class="form-group">
        <label for="unit">Unité de référence :</label>
        <select
          id="unit"
          v-model="formData.Unit"
          :disabled="useAI || loading"
          required
        >
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
          :disabled="(useAI && loadingNutrition) || loading"
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
          :disabled="(useAI && loadingNutrition) || loading"
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
          :disabled="(useAI && loadingNutrition) || loading"
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
          :disabled="(useAI && loadingNutrition) || loading"
          required
        />
      </div>
      <div class="form-group">
        <label>Vitamines :</label>
        <input
          v-model="formData.Vitamines"
          :disabled="(useAI && loadingNutrition) || loading"
          placeholder="Ex : A, C, K"
        />
      </div>
      <div class="form-group">
        <label>Minéraux :</label>
        <input
          v-model="formData.Mineraux"
          :disabled="(useAI && loadingNutrition) || loading"
          placeholder="Ex : Calcium, Fer"
        />
      </div>

      <!-- Submit -->
      <button type="submit" :disabled="loadingNutrition || loading">
        {{ isEdit ? "Mettre à jour" : "Créer" }}
      </button>
      <span v-if="loading" class="spinner"></span>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(false);

const isEdit = ref(false);
const useAI = ref(false);
const loadingNutrition = ref(false);
const formData = ref({
  Name: "",
  Unit: "",
  Calories: 0,
  Proteines: 0,
  Glucides: 0,
  Lipides: 0,
  Vitamines: "",
  Mineraux: "",
});

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    isEdit.value = true;
    try {
      const res = await fetch(`http://localhost:3000/api/ingredients/${id}`);
      formData.value = await res.json();
    } catch (e) {
      console.error("Chargement ingrédient :", e);
    }
  }
});

const onToggleAI = async () => {
  if (useAI.value && formData.value.Name.trim()) {
    await fetchNutrition();
  }
};

const maybeFetchNutrition = async () => {
  if (useAI.value) {
    await fetchNutrition();
  }
};

const fetchNutrition = async () => {
  loadingNutrition.value = true;
  try {
    const name = encodeURIComponent(formData.value.Name.trim());
    const res = await fetch(
      `http://localhost:3000/api/ingredients/nutrition?name=${name}`
    );
    if (!res.ok) throw new Error("Impossible de récupérer la nutrition");
    const data = await res.json();
    Object.assign(formData.value, data);
  } catch (err) {
    console.error("Nutrition IA error:", err);
    alert("Erreur lors de la récupération des données nutritionnelles");
  } finally {
    loadingNutrition.value = false;
  }
};

const handleSubmit = async () => {
  try {
    if (loading.value) return;
    loading.value = true;
    const payload = { ...formData.value };
    const id = route.params.id;
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
    loading.value = false;
    toast.success(
      id
        ? "Ingrédient mis à jour avec succès !"
        : "Ingrédient créé avec succès !"
    );
    router.push("/ingredients");
    toast.success("Ingrédient enregistré avec succès !");
  } catch (e) {
    console.error("Erreur lors de la soumission :", e);
    toast.error(e.message || "Erreur lors de la soumission");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.ingredient-form-view {
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

    input[type="checkbox"] {
      width: auto;
      margin-right: 0.5rem;
      transform: scale(1.2);
    }
  }

  button {
    width: 100%;
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
