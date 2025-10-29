import React, { useState, useEffect } from 'react';
import { Search, Clock, Heart, Calendar, ChefHat, Sparkles, X, ArrowLeft } from 'lucide-react';

const RecipeApp = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');

  const moods = [
    { name: 'Happy', emoji: '😊', keywords: ['chicken', 'pasta', 'pizza'] },
    { name: 'Tired', emoji: '😴', keywords: ['soup', 'chicken', 'rice'] },
    { name: 'Romantic', emoji: '💝', keywords: ['chocolate', 'strawberry', 'salmon'] },
    { name: 'Hungry', emoji: '🤤', keywords: ['beef', 'burger', 'steak'] },
    { name: 'Healthy', emoji: '🥗', keywords: ['chicken', 'fish', 'salad'] },
    { name: 'Adventurous', emoji: '🌶️', keywords: ['curry', 'spicy', 'lamb'] }
  ];

  const timeOptions = [
    { time: '10 mins', keywords: ['egg', 'toast', 'pancake'] },
    { time: '20 mins', keywords: ['pasta', 'chicken', 'fish'] },
    { time: '30 mins', keywords: ['rice', 'curry', 'stew'] },
    { time: '45+ mins', keywords: ['beef', 'lamb', 'roast'] }
  ];

  const occasions = [
    { name: 'Birthday', emoji: '🎂', keywords: ['cake', 'chicken', 'chocolate'] },
    { name: 'Festival', emoji: '🎉', keywords: ['dessert', 'sweet', 'lamb'] },
    { name: 'Anniversary', emoji: '💑', keywords: ['salmon', 'steak', 'chocolate'] },
    { name: 'Family Dinner', emoji: '👨‍👩‍👧‍👦', keywords: ['chicken', 'pasta', 'rice'] },
    { name: 'Date Night', emoji: '🌹', keywords: ['salmon', 'beef', 'pasta'] },
    { name: 'Casual Hangout', emoji: '🍕', keywords: ['pizza', 'burger', 'chicken'] }
  ];

  const searchRecipe = async (query) => {
    setLoading(true);
    try {
      // Search by name using TheMealDB API
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await response.json();
      
      console.log('Search results:', data); // Debug log
      setRecipes(data.meals || []);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setRecipes([]);
    }
    setLoading(false);
  };

  const fetchByIngredient = async (ingredient) => {
    setLoading(true);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error fetching by ingredient:', error);
      return [];
    }
  };

  const fetchRecipeDetails = async (id) => {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await response.json();
      setSelectedRecipe(data.meals[0]);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      searchRecipe(searchQuery);
    }
  };

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood.name);
    setLoading(true);
    let allRecipes = [];
    for (const keyword of mood.keywords) {
      const results = await fetchByIngredient(keyword);
      allRecipes = [...allRecipes, ...results];
    }
    const uniqueRecipes = Array.from(new Map(allRecipes.map(item => [item.idMeal, item])).values());
    setRecipes(uniqueRecipes);
    setLoading(false);
  };

  const handleTimeSelect = async (timeOpt) => {
    setSelectedTime(timeOpt.time);
    setLoading(true);
    let allRecipes = [];
    for (const keyword of timeOpt.keywords) {
      const results = await fetchByIngredient(keyword);
      allRecipes = [...allRecipes, ...results];
    }
    const uniqueRecipes = Array.from(new Map(allRecipes.map(item => [item.idMeal, item])).values());
    setRecipes(uniqueRecipes);
    setLoading(false);
  };

  const handleOccasionSelect = async (occasion) => {
    setSelectedOccasion(occasion.name);
    setLoading(true);
    let allRecipes = [];
    for (const keyword of occasion.keywords) {
      const results = await fetchByIngredient(keyword);
      allRecipes = [...allRecipes, ...results];
    }
    const uniqueRecipes = Array.from(new Map(allRecipes.map(item => [item.idMeal, item])).values());
    setRecipes(uniqueRecipes);
    setLoading(false);
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim() && !selectedIngredients.includes(ingredientInput.toLowerCase())) {
      setSelectedIngredients([...selectedIngredients, ingredientInput.toLowerCase()]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ing) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ing));
  };

  const searchByIngredients = async () => {
    if (selectedIngredients.length === 0) return;
    
    setLoading(true);
    const firstIngredient = selectedIngredients[0];
    let results = await fetchByIngredient(firstIngredient);
    
    if (selectedIngredients.length > 1) {
      const filteredResults = [];
      for (const recipe of results) {
        const details = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`);
        const data = await details.json();
        const meal = data.meals[0];
        
        const recipeIngredients = [];
        for (let i = 1; i <= 20; i++) {
          const ing = meal[`strIngredient${i}`];
          if (ing && ing.trim()) {
            recipeIngredients.push(ing.toLowerCase());
          }
        }
        
        const hasAllIngredients = selectedIngredients.every(userIng => 
          recipeIngredients.some(recipeIng => recipeIng.includes(userIng))
        );
        
        if (hasAllIngredients) {
          filteredResults.push(recipe);
        }
      }
      results = filteredResults;
    }
    
    setRecipes(results);
    setLoading(false);
  };

  const getIngredientsList = (meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({ ingredient, measure });
      }
    }
    return ingredients;
  };

  const resetFilters = () => {
    setSelectedMood('');
    setSelectedTime('');
    setSelectedOccasion('');
    setSelectedIngredients([]);
    setRecipes([]);
  };

  if (selectedRecipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedRecipe(null)}
            className="mb-4 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Recipes
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <img
              src={selectedRecipe.strMealThumb}
              alt={selectedRecipe.strMeal}
              className="w-full h-80 object-cover"
            />
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold text-gray-800">{selectedRecipe.strMeal}</h1>
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {selectedRecipe.strCategory}
                </span>
              </div>
              
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Cuisine:</span> {selectedRecipe.strArea}
              </p>
              
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ChefHat className="text-orange-500" />
                  Ingredients
                </h2>
                <div className="bg-orange-50 rounded-xl p-6">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getIngredientsList(selectedRecipe).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span className="font-medium">{item.measure}</span>
                        <span>{item.ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="text-orange-500" />
                  Instructions
                </h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedRecipe.strInstructions}
                  </p>
                </div>
              </div>
              
              {selectedRecipe.strYoutube && (
                <div className="mt-8">
                  <a
                    href={selectedRecipe.strYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Watch Video Tutorial
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ChefHat className="text-orange-500" size={48} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              AI Recipe Finder
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Your intelligent cooking assistant powered by AI</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Search for any recipe... (e.g., idly, biryani, pasta)"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition font-medium"
            >
              Search
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => { setActiveTab('search'); resetFilters(); }}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition ${
                activeTab === 'search' 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="inline mr-2" size={18} />
              Quick Search
            </button>
            <button
              onClick={() => { setActiveTab('mood'); resetFilters(); }}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition ${
                activeTab === 'mood' 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className="inline mr-2" size={18} />
              Cook by Mood
            </button>
            <button
              onClick={() => { setActiveTab('time'); resetFilters(); }}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition ${
                activeTab === 'time' 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="inline mr-2" size={18} />
              Cook by Time
            </button>
            <button
              onClick={() => { setActiveTab('occasion'); resetFilters(); }}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition ${
                activeTab === 'occasion' 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="inline mr-2" size={18} />
              Cook by Occasion
            </button>
            <button
              onClick={() => { setActiveTab('ingredients'); resetFilters(); }}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition ${
                activeTab === 'ingredients' 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="inline mr-2" size={18} />
              Cook by Ingredients
            </button>
          </div>

          {activeTab === 'mood' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">How are you feeling today?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {moods.map((mood) => (
                  <button
                    key={mood.name}
                    onClick={() => handleMoodSelect(mood)}
                    className={`p-6 rounded-xl border-2 transition ${
                      selectedMood === mood.name
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{mood.emoji}</div>
                    <div className="font-semibold text-gray-800">{mood.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'time' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">How much time do you have?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {timeOptions.map((opt) => (
                  <button
                    key={opt.time}
                    onClick={() => handleTimeSelect(opt)}
                    className={`p-6 rounded-xl border-2 transition ${
                      selectedTime === opt.time
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <Clock className="mx-auto mb-2 text-orange-500" size={32} />
                    <div className="font-semibold text-gray-800">{opt.time}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'occasion' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">What's the occasion?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {occasions.map((occ) => (
                  <button
                    key={occ.name}
                    onClick={() => handleOccasionSelect(occ)}
                    className={`p-6 rounded-xl border-2 transition ${
                      selectedOccasion === occ.name
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{occ.emoji}</div>
                    <div className="font-semibold text-gray-800">{occ.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">What ingredients do you have?</h3>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                  placeholder="Type an ingredient (e.g., egg, milk)"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
                <button
                  onClick={handleAddIngredient}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
                >
                  Add
                </button>
              </div>
              
              {selectedIngredients.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedIngredients.map((ing) => (
                      <span
                        key={ing}
                        className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full flex items-center gap-2"
                      >
                        {ing}
                        <button onClick={() => handleRemoveIngredient(ing)}>
                          <X size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={searchByIngredients}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition font-medium"
                  >
                    Find Recipes with These Ingredients
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Finding delicious recipes...</p>
          </div>
        )}

        {!loading && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.idMeal}
                onClick={() => fetchRecipeDetails(recipe.idMeal)}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition transform hover:-translate-y-1"
              >
                <img
                  src={recipe.strMealThumb}
                  alt={recipe.strMeal}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{recipe.strMeal}</h3>
                  <button className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2">
                    View Recipe
                    <ChefHat size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && recipes.length === 0 && (searchQuery || selectedMood || selectedTime || selectedOccasion || selectedIngredients.length > 0) && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
            <ChefHat className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-gray-600 text-lg">No recipes found. Try different search terms or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeApp;