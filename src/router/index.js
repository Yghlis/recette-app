// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import RecipeDetailView from '@/views/RecipeDetailView.vue';
import RecipeFormView from '@/views/RecipeFormView.vue';
import IngredientsView from '@/views/IngredientsView.vue';
import IngredientDetailView from '@/views/IngredientDetailView.vue';
import IngredientFormView from '@/views/IngredientFormView.vue';
import GenerateRecipeView  from '@/views/GenerateRecipeView.vue'; 

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/recipe/:id', name: 'RecipeDetail', component: RecipeDetailView },
  { path: '/create', name: 'CreateRecipe', component: RecipeFormView },
  { path: '/edit/:id', name: 'EditRecipe', component: RecipeFormView, props: true },
  { path: '/generate',    component: GenerateRecipeView },   
  // Routes pour les ingrédients
  { path: '/ingredients', name: 'Ingredients', component: IngredientsView },
  { path: '/ingredient/:id', name: 'IngredientDetail', component: IngredientDetailView },
  { path: '/ingredient/create', name: 'CreateIngredient', component: IngredientFormView },
  { path: '/ingredient/edit/:id', name: 'EditIngredient', component: IngredientFormView, props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
