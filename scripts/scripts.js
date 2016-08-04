
// writing function to make writing this easier
function byId(id) {
  return document.getElementById(id);
}
function byClass(className) {
  return document.getElementsByClassName(className);

}


var icons = byClass('logo'),
    desc = byClass('icon-description'),
    container = byId('icons');


// solution via Timo, thank you
function toggleAllIcons() {
  for(var i = 0; i < icons.length; i++) {
    icons[i].classList.toggle('hidden');
  }
}

function toggleDescription(e) {
  var target = e.target,
      parent = target.parentNode,
      targetIndex = Array.prototype.indexOf.call(icons, parent),
      description = desc[targetIndex];
  if(!parent.classList.contains('logo')) {
    return;
  }

  toggleAllIcons();
  parent.classList.remove('hidden');
  description.classList.toggle('active');
  container.classList.toggle('clicked');
}

if (container) {
  container.addEventListener('click', toggleDescription);
}


//smooth scroll-behavior
var toggler = byId('nav-toggler'),
    contactBtn = byClass('contactBtn'),
    targetOffset, currentPosition,
    body = document.body,
    animateTime = 000;
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    if(!!window.chrome && !isOpera )
    { animateTime = 900;
    }

// get the y offset
function getPageScroll() {
  var yScroll;
  if (window.pageYOffset) {
    yScroll = window.pageYOffset;
  } else if (document.documentElement && document.documentElement.scrollTop) {
    yScroll = document.documentElement.scrollTop;
  } else if (document.body) { //last resort
    yScroll = document.body.scrollTop;
  }
  return yScroll;
}
function smoothSroll(event) {
  if(!event) {
    event = window.event;
  }
  var target = event.target;
  targetOffset = byId(target.dataset.href.substr(1)).offsetTop;
  currentPosition = getPageScroll(); // uses yScroll's value

  // accounting for hidden-nav
  if (toggler.checked && window.innerWidth < 750){
    targetOffset = targetOffset ;
    currentPosition = currentPosition;
  } else if(toggler.checked){
    targetOffset = targetOffset  / 1.65;
    currentPosition = currentPosition /1.65;
  }
  body.classList.add('in-transition');
  body.style.WebitTransform = "translate(0, -" + (targetOffset - currentPosition) + "px)";
  body.style.MozTransform = "translate(0, -" + (targetOffset - currentPosition) + "px)";
  body.style.transform = "translate(0, -" + (targetOffset - currentPosition) + "px)";


  window.setTimeout(function () {
    body.classList.remove('in-transition');
    body.style.cssText = "";
    window.scrollTo(0, targetOffset);
  }, animateTime);

  event.preventDefault();
}
for (var i = 0; i < contactBtn.length; i++){
contactBtn[i].addEventListener('click', function(event) {
    smoothSroll(event);
  }, false);
}


// // via Timo
// // new function for looping over nodeLists
// // this is probably one of my favorite frontend js functions
function forEach(list, callback) {
  // reverse loop for fun, ease and speed
  for (var i = list.length; i--;) {
    callback(list[i], i, list);
  }
}


var parentProcess = byId('process');
var checks = byClass('process-checkbox');
var workButtons = byClass('process-checkoff');
var checkMark = '<i class="fa fa-check"></i>';

function toggleCheckbox(i) {
  checks[i].checked = true;
  workButtons[i].innerHTML = checkMark;
  workButtons[i].classList.remove('highlight');
}

function checkboxEvent(e) {
  var target = e.target;
  var parent = target.parentElement;
  var parentList = Array.prototype.slice.call(parentProcess.children); // fix: no more filter!
  var targetIndex = Array.prototype.indexOf.call(parentList, parent);
  toggleCheckbox(targetIndex);

}

if(parentProcess) {
  forEach(workButtons, function(button) {
    button.addEventListener('click', checkboxEvent);
  });
}
// Load more posts functionality ajax request
var loadMore = byId('load-more');
  function loadJSON(callback) {
    var jsonStuff = new XMLHttpRequest();
    jsonStuff.overrideMimeType("application/json");
    jsonStuff.open('GET', 'https://darianrosebrook.com/scripts/posts.json', true);
    jsonStuff.onreadystatechange = function () {
      if (jsonStuff.readyState == 4 && jsonStuff.status == "200") {
        callback(jsonStuff.responseText);
      }
      console.log(jsonStuff);
    };
    jsonStuff.send(null);
  }
function init() {
 loadJSON(function(response) {
  // Parse JSON string into object
    var actual_JSON = JSON.parse(response);

 });
}
var list = byId('list');
var oldContent = list.innerHTML;
var xobj ={
  "posts": [

      {
        "title": "Burn the Boats&#58; An Update On My Current 2016 Goals",
        "url": "/article/Update-On-2016-Goals",
        "date": "Jul 15, 2016",
        "img": "assets/torch.jpg",
        "content": "What I love about phrases like these is that though they are removed from any part of what we do now in our time, their message is reused and repurposed into something that fits our current situations.",
        "class": "type-life",
        "type": "Life Stuff"
      } ,

      {
        "title": "Handling Expectational Debt And Falling Behind.",
        "url": "/article/handling-expectational-debt-and-falling-behind",
        "date": "May 20, 2016",
        "img": "assets/expectational-debt.jpg",
        "content": "Why are we all given the same 24 hours? A lot of people seem to get more done than I can, and yet no one has more time during the day than others. Even since I started working 6 years ago, I have not earned any extra time in my life. Why do I feel more exhausted than my earlier self?",
        "class": "type-life",
        "type": "Life-Hacks"
      } ,

      {
        "title": "A Work Flow Process for Creating Better Websites",
        "url": "/article/Web-Design-Work-Flow-for-2016",
        "date": "May 12, 2016",
        "img": "assets/office.jpg",
        "content": "Designing websites is so much more than throwing together some layout and fonts. The process dives much deeper than that. What web design has become is an iterative process of discovery and problem solving.",
        "class": "type-web",
        "type": "Web Design"
      } ,

      {
        "title": "Branding and Logo Design Work Flow for 2016",
        "url": "/article/Branding-and-Logo-Design-Work-Flow-for-2016",
        "date": "May 20, 2016",
        "img": "assets/rocks-hands.jpg",
        "content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna a ...",
        "class": "type-brand",
        "type": "Branding"
      } ,

      {
        "title": "How To Be Like Darian",
        "url": "/article/How-To-Be-like-Darian",
        "date": "Jan 1, 2016",
        "img": "assets/notebook.jpg",
        "content": "Be Awesome. Nuff Said.",
        "class": "type-life",
        "type": "Life Stuff"
      }


  ]
}
;
var newContent = '';
for (var i = 0; i < xobj.posts.length; i++) {
  newContent += '<article class=\"list-item\">\n\t<div class=\"circle\">';
  newContent += '<img src=\"https://darianrosebrook.com' + xobj.posts[i].img + '\" alt=\"' + xobj.posts[i].title + '\" /></div>\n';
  newContent += '<div class=\"artcont\">\n\t<h2><a href=\"' + xobj.posts[i].url + '\">' + xobj.posts[i].title + '</a></h2>\n\t';
  newContent += '<p><small>' + xobj.posts[i].when + '<em class=\"' + xobj.posts[i].class + " \>" + xobj.posts[i].type + '</em></small>\n';
  newContent += '<small class=\"metaDesc\">&ldquo;' + xobj.posts[i].metaDesc + '&rdquo;</small></p></div></article>'; }
