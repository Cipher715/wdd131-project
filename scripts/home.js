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
    async getRandomRecipe() {
      const response = await fetch(baseURL+`random.php`);
      const data = await convertToJson(response);
      return data.meals[0];
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

class Welcome{
    async init(){
        let recipe = await service.getRandomRecipe();
        detail.init(recipe);
    }
}

const service = new ExternalService();
const detail = new RecipeDetail();
const welcome = new Welcome();

welcome.init();