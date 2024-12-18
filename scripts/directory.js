const baseURL = "https://www.themealdb.com/api/json/v1/1/";

async function convertToJson(res) {
    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      throw { name: 'servicesError', message: data };
    }
}

function RecipeDetailsTemplate(recipe, ingredients, instructions) {
    return `<section class="recipe-detail"> <h3>${recipe.strMeal}</h3>
    <div class="recipe-detail__add">
    <button id="favorite" data-id="${recipe.idMeal}">Add to Bookmark</button>
    </div>
    <img class="divider"
      src="${recipe.strMealThumb}"
      alt="${recipe.strMeal}"
      loading="lazy"
    />
    <h3>Ingredients</h3>
    <div class="recipe-ingredients">${ingredients}</div>
    <h3>Instructions</h3>
    <a href="${recipe.strYoutube}">YouTube</a>
    <p class="recipe-instructions">${instructions}</p>
    </section>`;
}

function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}
  
function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function alertMessage(message, scroll = true) {
    const alert = document.createElement('div');
    alert.classList.add('alert');
    alert.innerHTML = `<p>${message}</p><span>X</span>`;
    alert.addEventListener('click', function(e) {
        if(e.target.tagName == "SPAN") { 
          main.removeChild(this);
        }
    })
  
    const main = document.querySelector('main');
    main.prepend(alert);
  
    if(scroll)
      window.scrollTo(0,0);
}

class ExternalService {
    constructor() {}
    async getDetail(id) {
      const response = await fetch(baseURL+`lookup.php?i=${id}`);
      const data = await convertToJson(response);
      return data.meals[0];
    }
    async getIngredientList() {
        const response = await fetch(baseURL+`list.php?i=list`);
        const data = await convertToJson(response);
        return data.meals;
    }
    async getCategoryList() {
        const response = await fetch(baseURL+`list.php?c=list`);
        const data = await convertToJson(response);
        return data.meals;
    }
    async getAreaList() {
        const response = await fetch(baseURL+`list.php?a=list`);
        const data = await convertToJson(response);
        return data.meals;
    }
    async filterListByIngredient(ingredient){
        const response = await fetch(baseURL+`filter.php?i=${ingredient}`);
        const data = await convertToJson(response);
        return data.meals;
    }
    async filterListByCategory(category){
        const response = await fetch(baseURL+`filter.php?c=${category}`);
        const data = await convertToJson(response);
        return data.meals;
    }
    async filterListByArea(area){
        const response = await fetch(baseURL+`filter.php?a=${area}`);
        const data = await convertToJson(response);
        return data.meals;
    }
}

class RecipeDetail {
    constructor(render = "main"){
        this.recipe = "";
        this.ingredients = "";
        this.instruction = "";
        this.render = render;
    }
    async init(recipe) {
        this.recipe = recipe;
        this.cleanIngredients();
        this.cleanInstruction();
        this.renderRecipeDetails(this.render);
        document.getElementById('favorite')
          .addEventListener('click', this.addBookmark.bind(this));
    }
    
    cleanIngredients(){
        let element ="";
        let ingredient = "";
        let measure = "";
        let i = 1;
        while(true){
            if(i >= 21){
                break;
            }
            ingredient = this.recipe[`strIngredient${i}`];
            measure = this.recipe[`strMeasure${i}`];
            if(ingredient == ""|| ingredient == null){
                break;
            }
            element += `<li>${ingredient} : ${measure}</li>`;
            i++;
        }
        this.ingredients = element;
    }

    cleanInstruction(){
        let instruction = this.recipe["strInstructions"];
        let cleaned = instruction.replace(/\r\n/g, "<br>");
        this.instruction = cleaned;
    }

    async addBookmark(){
        let currentBookmark = await getLocalStorage("bookmark");
        let recipes = [];
        let isAlreadyAdded = false;
        if (currentBookmark != null) {
            isAlreadyAdded = currentBookmark.some(item => item.idMeal === this.recipe.idMeal);
            recipes = currentBookmark;
        }
        if(isAlreadyAdded){
            alertMessage(`${this.recipe.strMeal} is already added to bookmark!`);
        }else {
            recipes.push(this.recipe);
            setLocalStorage("bookmark", recipes);
            alertMessage(`${this.recipe.strMeal} added to bookmark!`);
        }
    }
    renderRecipeDetails(select){
        const element = document.querySelector(select);
        element.insertAdjacentHTML(
        "beforeend",
        RecipeDetailsTemplate(this.recipe, this.ingredients, this.instruction)
        );
    }
}

class Directory {
    async init(){
        this.ingredients = await service.getIngredientList();
        this.categories = await service.getCategoryList();
        this.areas = await service.getAreaList();
        this.getFilters();
        document.querySelector('.recipeMessage').innerHTML = "Select a filter to show recipes.";
    }
    reset(){
        document.querySelector('.recipeList').innerHTML = "";
        document.querySelector('.recipeDetail').innerHTML = "";
        document.querySelector('.recipeMessage').innerHTML = "";
    }
    getFilters(){
        const ingredientSelector = document.querySelector("#ingre");
        const categorySelector = document.querySelector("#category");
        const areaSelector = document.querySelector("#area");
        this.ingredients.forEach(ingredient => {
            let option = document.createElement('option');
            option.setAttribute('value', `${ingredient.strIngredient}`);
            option.textContent = `${ingredient.strIngredient}`;
            ingredientSelector.appendChild(option);
        });
        this.categories.forEach(category => {
            let option = document.createElement('option');
            option.setAttribute('value', `${category.strCategory}`);
            option.textContent = `${category.strCategory}`;
            categorySelector.appendChild(option);
        });
        this.areas.forEach(area => {
            let option = document.createElement('option');
            option.setAttribute('value', `${area.strArea}`);
            option.textContent = `${area.strArea}`;
            areaSelector.appendChild(option);
        });
        ingredientSelector.addEventListener("change", () => {this.getFilteredIngredient()});
        categorySelector.addEventListener("change", () => {this.getFilteredCategory()});
        areaSelector.addEventListener("change", () => {this.getFilteredArea()});
    }

    async getFilteredIngredient(){
        const ingredient = document.querySelector('#ingre').value;
        document.querySelector('#category').value = "";
        document.querySelector('#area').value  = "";
        const filteredRecipe = await service.filterListByIngredient(ingredient);
        this.displayRecipeList(filteredRecipe);
    }

    async getFilteredCategory(){
        document.querySelector('#ingre').value = "";
        const category = document.querySelector('#category').value;
        document.querySelector('#area').value = "";
        const filteredRecipe = await service.filterListByCategory(category);
        this.displayRecipeList(filteredRecipe);
    }

    async getFilteredArea(){
        document.querySelector('#ingre').value = "";
        document.querySelector('#category').value = "";
        const area = document.querySelector('#area').value;
        const filteredRecipe = await service.filterListByArea(area);
        this.displayRecipeList(filteredRecipe);
    }

    displayRecipeList(list) {
        this.reset();
        let recipeMessage = document.querySelector('.recipeMessage');
        let recipeList = document.querySelector('.recipeList');
        let message = document.createElement('h3');
        message.textContent = "Click image to see the details";
        recipeMessage.appendChild(message);
        list.forEach(recipe => {
            let article = document.createElement('article');
            let h4 = document.createElement('h4');
            h4.textContent = recipe.strMeal;
            let img = document.createElement('img');
            img.setAttribute('src', `${recipe.strMealThumb}`);
            img.setAttribute('alt', `${recipe.strMeal}`);
            img.className = 'recipeImage';
            img.id = `${recipe.idMeal}`;
            article.appendChild(h4);
            article.appendChild(img);
            recipeList.appendChild(article);
        })
        document.querySelectorAll('.recipeImage').forEach((recipe) =>{
           recipe.addEventListener("click", this.getRecipe);
        })
    }

    async getRecipe(e){
        let id = e.target.getAttribute("id");
        document.querySelector('.recipeList').innerHTML = "";
        document.querySelector('.recipeDetail').innerHTML = "";
        document.querySelector('.recipeMessage').innerHTML = "";
        const recipe = await service.getDetail(id);
        detail.init(recipe);
    }

}

const service = new ExternalService();
const detail = new RecipeDetail(".recipeDetail");
const directory = new Directory();

directory.init();
