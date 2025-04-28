<template>
  <div class="gen-view">
    <h2>Générer une recette par IA</h2>

    <textarea
      v-model="prompt"
      rows="4"
      placeholder="Décris ici la recette souhaitée …"
    >
    </textarea>

    <button @click="generate" :disabled="loading">
      {{ loading ? "Veuillez patienter…" : "Générer" }}
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const prompt = ref("");
const loading = ref(false);
const router = useRouter();

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
    alert(e.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.gen-view {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
}
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  margin-top: 12px;
  padding: 8px 16px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  background: #369a6f;
}
</style>
