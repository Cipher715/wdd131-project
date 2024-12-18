function updateBookmark(e){
    let id = e.target.getAttribute("data-id");
    let newList = favorites.filter(item => item.idMeal != id);
    alertMessage("Successfully removed from bookmark!");
    setLocalStorage("bookmark", newList);
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

function RecipeDetailsTemplate(recipe, ingredients, instructions) {
    return `<section class="recipe-detail"> <h3>${recipe.strMeal}</h3>
    <div class="recipe-detail__add">
    <button id="favorite" data-id="${recipe.idMeal}">Add to Bookmark</button>
    </div>
    <img class="divider"
      src="${recipe.strMealThumb}"
      alt="${recipe.strMeal}"
    />
    <h3>Ingredients</h3>
    <div class="recipe-ingredients">${ingredients}</div>
    <h3>Instructions</h3>
    <a href="${recipe.strYoutube}">YouTube</a>
    <p class="recipe-instructions">${instructions}</p>
    </section>`;
}


class Bookmark {
    constructor(){}
    async init(){
        this.displayRecipeList(favorites)
    }
    reset(){
        document.querySelector('.recipeList').innerHTML = "";
        document.querySelector('.recipeDetail').innerHTML = "";
        document.querySelector('.recipeMessage').innerHTML = "";
        document.querySelector('.removeBookmark').innerHTML = "";
    }
    displayRecipeList(list) {
        this.reset();
        let recipeMessage = document.querySelector('.recipeMessage');
        let recipeList = document.querySelector('.recipeList');
        let message = document.createElement('h3');
        message.textContent = "Here are your favorites!";
        recipeMessage.appendChild(message);
        list.forEach(recipe => {
            let article = document.createElement('article');
            let h4 = document.createElement('h4');
            h4.textContent = recipe.strMeal;
            let img = document.createElement('img');
            img.setAttribute('src', `${recipe.strMealThumb}`);
            img.setAttribute('alt', `${recipe.strMeal}`);
            img.setAttribute('loading', 'lazy');
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
        document.querySelector('.recipeMessage').innerHTML = `<a href="/bookmark.html">＜Back to bookmark list</a>`;
        document.querySelector('.removeBookmark').innerHTML = `<button id="unFavorite" data-id="${id}">Remove from Bookmark</button>`
        let recipe = favorites.find(item => item.idMeal === id);
        detail.init(recipe);
        document.getElementById('unFavorite').addEventListener('click', updateBookmark);

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

const favorites = getLocalStorage("bookmark");
const detail = new RecipeDetail(".recipeDetail");
const bookmark = new Bookmark();

bookmark.init();