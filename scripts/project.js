const baseURL = "https://www.themealdb.com/api/json/v1/1/";

async function convertToJson(res) {
    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      throw { name: 'servicesError', message: data };
    }
}

export default class ExternalServices {
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
    async searchRecipe(name){
      const response = await fetch(baseURL+`filter.php?s=${name}`);
      const data = await convertToJson(response);
      return data.meals;
    }
}