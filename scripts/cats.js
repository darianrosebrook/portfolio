// load some cats
// writing function to make writing this easier
function byId(id) {
  return document.getElementById(id);
}
function byClass(className) {
  return document.getElementsByClassName(className);

}
var catList = byId('cats'),
  catContent = catList.innerHTML,
  newCats = '',
  cat_JSON,
  loadCats = byId('catLoader'),
  q = 0,
  f;



function catJSON(callback) {

    var jsonStuff = new XMLHttpRequest();
    jsonStuff.overrideMimeType("application/json");
    jsonStuff.open('GET', '../../scripts/cats.json', true);
    jsonStuff.onreadystatechange = function () {
      // if (jsonStuff.readyState == 4 && jsonStuff.status == "200") { // when it's done... do this
        callback(jsonStuff.responseText);
      // }
    };
  jsonStuff.send(null);
}
function cat() {
 catJSON(function(response) {
  // Parse JSON string into object
    cat_JSON = JSON.parse(response);
    f = cat_JSON.posts.length;
    addCats(cat_JSON);
    }
  )
};
function addCats(obj){
  for ( q; q < f; q++) {
    newCats += '<article class=\"cat-list-item\"' + obj.posts[q].name + ' >\n\t';
    // newCats += '<img src=\"https://darianrosebrook.com/' + obj.posts[q].url + '\" alt=\"' + obj.posts[q].title + '\" />\n';
    newCats += '<img src=\"' + obj.posts[q].url + '\" alt=\"' + obj.posts[q].title + '\" />\n';
    newCats += '</article>\n';
  }
  console.log(newCats);
  catList.innerHTML += newCats;
  newCats = '';
}
loadCats.addEventListener('click', function (e){
  console.log(e);
  cat();
}, false);
