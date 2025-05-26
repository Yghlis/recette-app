<template>
  <div class="gen-view">
    <h2>Générer une recette par IA</h2>

    <textarea
      v-model="prompt"
      rows="4"
      placeholder="Décris ici la recette souhaitée …"
      :disabled="loading"
    >
    </textarea>
    <div class="cta">
      <button @click="generate" :disabled="loading">
        {{ loading ? "Veuillez patienter…" : "Générer" }}
      </button>
      <span v-if="loading" class="spinner"></span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const prompt = ref("");
const loading = ref(false);
const router = useRouter();
const toast = useToast();

async function generate() {
  if (!prompt.value.trim()) return;
  loading.value = true;

  try {
    /* 1) demande de recette formatée au backend */
    const r = await fetch("http://localhost:3000/api/recettes/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt.value }),
    });
    const draft = await r.json();
    if (!r.ok) throw new Error(draft.error || "Erreur génération");

    /* 2) création réelle */
    const create = await fetch("http://localhost:3000/api/recettes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const saved = await create.json();
    if (!create.ok) throw new Error(saved.error || "Erreur création");
    router.push(`/recette/${saved.id}`);
  } catch (e) {
    console.error("Erreur lors de la génération :", e);
    toast.error(e.message || "Erreur lors de la génération");
    return;
  } finally {
    loading.value = false;
    router.push("/");
    toast.success("Recette générée avec succès !");
  }
}
</script>

<style scoped lang="scss">
.gen-view {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  &:disabled {
    background: #d5d5d5;
    cursor: not-allowed;
  }
}

.cta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 12px;
  gap: 12px;
}

button {
  padding: 8px 16px;
  background: $primary-color;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover:not(:disabled) {
    background: lighten($primary-color, 10%);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.spinner {
  display: block;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #369a6f;
  border-radius: 50%;
  width: 24px;
  height: 24px;
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
