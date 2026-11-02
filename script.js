const recipes = [
  {id:'omelette',name:'Garden Omelette',emoji:'🍳',time:12,category:'Breakfast',ingredients:['eggs','tomato','onion','cheese','spinach'],description:'A fluffy, quick omelette packed with whatever vegetables you have.',steps:['Beat the eggs with a pinch of salt and pepper.','Chop the vegetables and cook them in a lightly oiled pan for 3–4 minutes.','Pour in the eggs, add cheese if you like, and cook gently until set.'],needs:['Eggs'],extra:'Serve with toast or a simple salad.'},
  {id:'tomato-pasta',name:'Easy Tomato Pasta',emoji:'🍝',time:20,category:'Lunch',ingredients:['pasta','tomato','onion','garlic','cheese','spinach'],description:'Comforting pasta with a simple tomato sauce and pantry staples.',steps:['Cook pasta in salted water according to the packet.','Soften chopped onion and garlic in a pan, then add chopped tomatoes.','Simmer for 10 minutes, toss with pasta, and finish with cheese.'],needs:['Pasta','Tomato'],extra:'Add spinach at the end to use up leafy greens.'},
  {id:'fried-rice',name:'Fridge-Clearing Fried Rice',emoji:'🍚',time:15,category:'Dinner',ingredients:['rice','eggs','carrot','peas','onion','soy sauce'],description:'A flexible one-pan meal that makes leftover rice shine.',steps:['Use cold cooked rice if possible.','Scramble the eggs in a hot pan and set aside.','Stir-fry any chopped vegetables, add rice and soy sauce, then fold the eggs back in.'],needs:['Rice','Eggs'],extra:'Use any vegetables you need to finish.'},
  {id:'chicken-skillet',name:'Herby Chicken Skillet',emoji:'🍗',time:30,category:'Dinner',ingredients:['chicken','potato','onion','tomato','garlic'],description:'A satisfying skillet dinner with tender chicken and vegetables.',steps:['Cut chicken and potatoes into bite-sized pieces.','Brown the chicken in a pan, then add onion and garlic.','Add potatoes, tomatoes and a splash of water; cover and cook until tender and chicken is fully cooked.'],needs:['Chicken'],extra:'Season with paprika, pepper or any herbs you have.'},
  {id:'potato-hash',name:'Crispy Potato Hash',emoji:'🥔',time:22,category:'Brunch',ingredients:['potato','onion','eggs','cheese','spinach'],description:'Golden potatoes with onion, finished with an egg or a little cheese.',steps:['Dice potatoes small and boil for 5 minutes, then drain.','Pan-fry with onion until golden and crisp.','Add spinach or cheese, and top with a fried egg if desired.'],needs:['Potato'],extra:'Cut potatoes evenly so they cook at the same speed.'},
  {id:'bean-bowl',name:'Warm Tomato & Bean Bowl',emoji:'🫘',time:18,category:'Lunch',ingredients:['beans','tomato','onion','rice','spinach'],description:'A hearty bowl made with beans, tomatoes and simple seasoning.',steps:['Soften chopped onion in a pan.','Add tomatoes and beans with a splash of water and seasoning.','Simmer for 10 minutes and serve over rice or wilted spinach.'],needs:['Beans','Tomato'],extra:'A squeeze of lemon or a pinch of chilli is lovely here.'},
  {id:'cheese-toast',name:'Cheesy Tomato Toast',emoji:'🧀',time:8,category:'Snack',ingredients:['bread','tomato','cheese','spinach'],description:'A quick snack with melty cheese and fresh tomato.',steps:['Toast the bread lightly.','Top with sliced tomato, cheese and spinach.','Grill or toast until the cheese melts and serve warm.'],needs:['Cheese','Tomato'],extra:'Season with black pepper or dried herbs.'},
  {id:'spinach-eggs',name:'Spinach Breakfast Cups',emoji:'🥬',time:18,category:'Breakfast',ingredients:['eggs','spinach','cheese','onion'],description:'Simple baked-style eggs with greens and cheese.',steps:['Heat the oven to 180°C / 350°F and lightly oil muffin cups.','Divide chopped spinach, onion and cheese between the cups.','Crack an egg into each and bake until the whites are set.'],needs:['Eggs','Spinach'],extra:'No oven? Cook the same ingredients covered in a small pan.'}
];

const state = {ingredients:[],favorites:JSON.parse(localStorage.getItem('pp-favorites')||'[]')};
const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const normalize = s=>s.toLowerCase().trim().replace(/[.,!?]/g,'');
const titleCase = s=>s.trim().replace(/\b\w/g,c=>c.toUpperCase());
let toastTimer;

function showToast(message){
  const toast=$('#toast'); toast.textContent=message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),2300);
}
function goTo(page){
  const target=document.getElementById(page);
  if(!target){showToast('That section is coming soon.');return;}
  $$('.page').forEach(p=>p.classList.toggle('active',p===target));
  $$('.nav a').forEach(a=>a.classList.toggle('active',a.dataset.page===page));
  $('#mainNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');
  window.scrollTo({top:0,behavior:'smooth'});
  if(page==='favorites') renderFavorites();
  if(page==='fridge') renderIngredients();
}
function addIngredient(value){
  const clean=titleCase(value||'');
  if(!clean){showToast('Type an ingredient first.');return;}
  if(state.ingredients.some(i=>normalize(i)===normalize(clean))){showToast(`${clean} is already on your list.`);return;}
  state.ingredients.push(clean); renderIngredients(); $('#ingredientInput').value=''; showToast(`${clean} added to your fridge.`);
}
function renderIngredients(){
  const list=$('#ingredientList'); $('#ingredientCount').textContent=state.ingredients.length;
  if(!state.ingredients.length){list.innerHTML='<div class="empty-state"><span>🥬</span><strong>Your fridge is waiting</strong><p>Add a few ingredients to get started.</p></div>';return;}
  list.innerHTML=state.ingredients.map((item,i)=>`<span class="ingredient-tag">${escapeHTML(item)}<button type="button" data-remove="${i}" aria-label="Remove ${escapeHTML(item)}">×</button></span>`).join('');
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function scoreRecipe(recipe,items){
  const terms=items.map(normalize);
  return recipe.ingredients.reduce((sum,ingredient)=>sum+(terms.some(t=>t===ingredient||t.includes(ingredient)||ingredient.includes(t))?1:0),0);
}
function matchingRecipes(items){
  if(!items.length)return [];
  return recipes.map(r=>({...r,score:scoreRecipe(r,items)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score||a.time-b.time);
}
function renderRecipes(container,items,heading,emptyMessage='No recipes found yet. Try another ingredient or search term.'){
  if(!items.length){container.innerHTML=`<div class="no-results"><strong>Nothing on the menu just yet</strong>${emptyMessage}</div>`;return;}
  container.innerHTML=`${heading?`<div class="results-heading"><h2>${heading}</h2><p>${items.length} idea${items.length===1?'':'s'} to explore</p></div>`:''}<div class="recipe-grid">${items.map(r=>recipeCard(r)).join('')}</div>`;
}
function recipeCard(r){
  const saved=state.favorites.includes(r.id);
  const subtitle=r.score!==undefined?`${r.score} matching ingredient${r.score===1?'':'s'} · ${r.category}`:`${r.category} · Easy`;
  return `<article class="recipe-card"><div class="recipe-card-top"><span class="recipe-emoji">${r.emoji}</span><button class="favorite-btn ${saved?'saved':''}" data-favorite="${r.id}" aria-label="${saved?'Remove from':'Add to'} favorites">${saved?'♥':'♡'}</button></div><h3>${r.name}</h3><p>${r.description}</p><div class="recipe-meta"><span>◷ ${r.time} min</span><span>${subtitle}</span></div><div class="card-actions"><button class="small-btn" data-recipe="${r.id}">View recipe →</button><button class="small-btn secondary" data-favorite="${r.id}">${saved?'Saved ♥':'Save ♡'}</button></div></article>`;
}
function findFromFridge(){
  const found=matchingRecipes(state.ingredients);
  const target=$('#fridgeRecipeResults');
  renderRecipes(target,found,'Ideas for your ingredients',state.ingredients.length?'Try adding more ingredients for more matches.':'Add at least one ingredient above, then try again.');
  if(!state.ingredients.length)showToast('Add ingredients first to find a match.');
  else target.scrollIntoView({behavior:'smooth',block:'start'});
}
function searchRecipes(query){
  const q=normalize(query);
  const found=recipes.filter(r=>!q||normalize(r.name).includes(q)||normalize(r.description).includes(q)||r.ingredients.some(i=>i.includes(q)||q.includes(i))||normalize(r.category).includes(q));
  renderRecipes($('#searchResults'),found,q?`Results for “${escapeHTML(query)}”`:'Recipe inspiration',q?'Try a different recipe name or ingredient.':'No recipes available.');
}
function renderFavorites(){
  const found=recipes.filter(r=>state.favorites.includes(r.id));
  renderRecipes($('#favoriteRecipes'),found,'Saved recipes','Tap the heart on a recipe card to save it here.');
}
function toggleFavorite(id){
  if(state.favorites.includes(id)){state.favorites=state.favorites.filter(x=>x!==id);showToast('Removed from favorites.');}
  else{state.favorites.push(id);showToast('Recipe saved to favorites.');}
  localStorage.setItem('pp-favorites',JSON.stringify(state.favorites));
  $('#favoriteCount').textContent=state.favorites.length;
  // Refresh visible recipe lists so the heart state remains accurate.
  if($('#favorites').classList.contains('active'))renderFavorites();
  if($('#search').classList.contains('active'))searchRecipes($('#recipeSearch').value);
  if($('#fridge').classList.contains('active')&&state.ingredients.length)renderRecipes($('#fridgeRecipeResults'),matchingRecipes(state.ingredients),'Ideas for your ingredients');
}
function openRecipe(id){
  const r=recipes.find(x=>x.id===id);if(!r)return;
  $('#dialogContent').innerHTML=`<div class="dialog-emoji">${r.emoji}</div><span class="eyebrow">${r.category.toUpperCase()} · ${r.time} MINUTES</span><h2>${r.name}</h2><p>${r.description}</p><h3>Ingredients to consider</h3><ul>${r.ingredients.slice(0,5).map(i=>`<li>${titleCase(i)}</li>`).join('')}</ul><h3>How to make it</h3><ol>${r.steps.map(s=>`<li>${s}</li>`).join('')}</ol><p><strong>Pick & Plate tip:</strong> ${r.extra}</p><button class="btn btn-primary" data-favorite="${r.id}">${state.favorites.includes(r.id)?'♥ Saved to favorites':'♡ Save to favorites'}</button>`;
  $('#recipeDialog').showModal();
}
function randomMeal(){
  let pool=state.ingredients.length?matchingRecipes(state.ingredients):recipes;
  if(!pool.length)pool=recipes;
  const chosen=pool[Math.floor(Math.random()*pool.length)];
  openRecipe(chosen.id);
}
$('#mainNav').addEventListener('click',e=>{const a=e.target.closest('[data-page]');if(a){e.preventDefault();goTo(a.dataset.page);}});
document.addEventListener('click',e=>{
  const go=e.target.closest('[data-go]');if(go){goTo(go.dataset.go);return;}
  const chip=e.target.closest('[data-ingredient]');if(chip){addIngredient(chip.dataset.ingredient);goTo('fridge');return;}
  const remove=e.target.closest('[data-remove]');if(remove){state.ingredients.splice(Number(remove.dataset.remove),1);renderIngredients();return;}
  const fav=e.target.closest('[data-favorite]');if(fav){toggleFavorite(fav.dataset.favorite);if($('#recipeDialog').open)openRecipe(fav.dataset.favorite);return;}
  const recipe=e.target.closest('[data-recipe]');if(recipe){openRecipe(recipe.dataset.recipe);return;}
  const search=e.target.closest('[data-search]');if(search){$('#recipeSearch').value=search.dataset.search;goTo('search');searchRecipes(search.dataset.search);}
});
$('#ingredientForm').addEventListener('submit',e=>{e.preventDefault();addIngredient($('#ingredientInput').value);});
$('#clearIngredients').addEventListener('click',()=>{state.ingredients=[];renderIngredients();$('#fridgeRecipeResults').innerHTML='';showToast('Ingredient list cleared.');});
$('#findFromFridge').addEventListener('click',findFromFridge);
$('#randomFromFridge').addEventListener('click',randomMeal);
$('#recipeSearchForm').addEventListener('submit',e=>{e.preventDefault();searchRecipes($('#recipeSearch').value);});
$('#closeDialog').addEventListener('click',()=>$('#recipeDialog').close());
$('#recipeDialog').addEventListener('click',e=>{if(e.target===$('#recipeDialog'))$('#recipeDialog').close();});
$('#menuToggle').addEventListener('click',()=>{const open=$('#mainNav').classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open));});
$('#favoriteCount').textContent=state.favorites.length;
renderIngredients();
searchRecipes('');
