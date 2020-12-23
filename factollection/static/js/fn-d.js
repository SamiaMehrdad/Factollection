/******************************************************
 * * Base Project : Factollection
 * A teamed project in GA-SEI 2020
 * Django/Python full stack app
 * Teammates : Mehrdad Samia, Rylee Shearer, Richard Lummus
 * * Repo:  https://github.com/SamiaMehrdad/Factollection
 * --------------------------------------------------
 * * MVC pattern following
*******************************************************/

/*----- constants ---------------------------------------------------*/

/*----- app's state (variables) -------------------------------------*/
let factIndex = 0;
let factsArray = [];
let modalResult = "update"; // otherwise it is create, delete is handled separately
let sheetId = getElemById("sheet-id").innerText.trim();
let currentLinkId = 0;
/*----- cached element references -----------------------------------*/
const bottomBandEl = getElemById("bottom-band");
const bottomAttentionEl = getElemById("bottom-attention");
const bottomContainerEl = getElemById("index-bottom-container");
const factEl = getElemById("fact");
const nextEl = getElemById("det-next");
const prevEl = getElemById("det-prev");
const shadeEl = getElemById("shade");
const modalDelEl = getElemById("delete-link");
const modalEditEl = getElemById("edit-link");
const linkTitleEl = getElemById("link-title");
const linkUrlEl = getElemById("link-url")
const allLinksEl = getElemById("links-area").children;
// console.log(typeof(allLinksEl));
/*----- event listeners -----------------------------------------------------*/
setEvent("det-next", "click", showNextFact);
setEvent("det-prev", "click", showPrevFact);
setEvent("remove","click", removeClicked);
setEvent("remove-no","click", removeCancel);
setEvent("remove-yes","click", removeProceed);
setEvent("save","click",saveSheet);
setEvent("link-edit-cancel","click",closeModal);
setEvent("link-remove-cancel","click",closeModal);
setEvent("add-link","click",addLink);
setEvent("del-link","click",linkDelAccepted);
setEvent("update-link","click",modalAccepted);
for( element of allLinksEl) { 
  setEvent(element.id,"click",linkAreaClick)
};
/*------- initializing ------------------------------------------------------*/
initLists();
/*----- functions -----------------------------------------------------------*/ 
function initLists()
{
  let facts =getElemById("data-facts").innerText.trim();
  console.log(facts,"-------");
  facts = facts.replaceAll("'",'');
  // factsArray = facts.substring(2, facts.length-2).split(",");
  factsArray = facts.split(";");
  for(fact of factsArray ){fact = fact.trim()}
  console.log(factsArray[0], factsArray[0].length);
  console.log(factsArray[1], factsArray[1].length);
    console.log(factsArray [2], factsArray[2].length);
}

function modalAccepted()
{
  let url = "";
  if(modalResult === "update" )
  {
    url = "/updatelink/"+currentLinkId+"/"+
          linkTitleEl.value+"/"+linkUrlEl.value;
    postData(url, "");
  }
  else
  {
    url = "/addlink/"+sheetId+"/"+
          linkTitleEl.value+"/"+linkUrlEl.value;
    postData(url, "");
  }
  console.log("URL=",url);
  closeModal();
  location.reload();
  return false;
}

function linkDelAccepted(e)
{
  let url="/deletelink/"+currentLinkId;
  postData(url, "");
  closeModal();
  location.reload();
  return false;
}
/**-------------------------------
 *  addLink() Will be run + button press
 *  This function will show modal panel
 *  * event handler
 *  * return : none
 *-------------------------------*/
function addLink()
{
  linkUrlEl.value = "";
  linkTitleEl.value = "";
  modalResult = "create";
  showModal(modalEditEl);
}
/**-------------------------------
 *  linkAreaClick() Will be run if edit or remove icon of a link is clicked
 *  This function will show related modal panel
 *  * event handler
 *  * return : none
 *-------------------------------*/
function linkAreaClick(e)
{
  let item = e.target.id;
  currentLinkId = item.substring(1);
 // console.log(e.target.id[0], " CLICKED");

  if( item[0] === 'd' )
    showModal(modalDelEl);
  if( item[0] === 'e' )
  { 
    console.log("EDIT LINK ID == ", currentLinkId);
    let target = getElemById(currentLinkId);
    linkTitleEl.value = target.innerText;
    linkUrlEl.value = target.getAttribute("href");
    modalResult = "update";
    showModal(modalEditEl);
  }
}
/**-------------------------------
 *  saveSheet() Will be run 
 *  * event handler
 *  * return : none
 *-------------------------------*/
function saveSheet()
{
  console.log("SAVE")
  let note = getElemById("fact-note").value;
 // let href = getElemById("save").getAttribute("href");
  getElemById("save").href += note;
}
/**-------------------------------
 *  showNextFact() Will be run 
 *  * event handler
 *  * return : none
 *-------------------------------*/
function showNextFact()
{
  if( factIndex >= factsArray.length-1 ) 
    {
      nextEl.classList.add("hidden");
      prevEl.classList.remove("hidden");
    } 
  else
    {
      factIndex++;
      console.log(factsArray[ factIndex ], typeof(factsArray[ factIndex ]));
      factEl.innerText = factsArray[ factIndex ];
    }
}
/**-------------------------------
 *  showPrevFact() Will be run 
 *  * event handler
 *  * return : none
 *-------------------------------*/
function showPrevFact()
{
  if( factIndex <= 0 ) 
    {
      prevEl.classList.add("hidden");
      nextEl.classList.remove("hidden");
    } 
  else
    {
      factIndex--;
      console.log(factsArray[ factIndex ], typeof(factsArray[ factIndex ]));
      factEl.innerText = factsArray[ factIndex ];
    }
}
/**-------------------------------
 *  removeClicked() Will be run remove is clicked
 *  * event handler
 *  * return : none
 *-------------------------------*/
function removeClicked()
{
  console.log("REMOVE");
  bottomAttentionEl.classList.remove("hidden");
  bottomBandEl.classList.add("attention");
  bottomContainerEl.classList.add("hidden");
}

/**-------------------------------
 *  removeCancel() Will be run remove cancel is clicked
 *  * event handler
 *  * return : none
 *-------------------------------*/
function removeCancel()
{
  bottomAttentionEl.classList.add("hidden");
  bottomBandEl.classList.remove("attention");
  bottomContainerEl.classList.remove("hidden");
}

/**-------------------------------
 *  removeProceed() Will be run remove is confirmed
 *  * event handler
 *  * return : none
 *-------------------------------*/
function removeProceed()
{
  console.log("REMOVE CONFIRMED");
  postData("/delete/",sheetId);
}
/**-------------------------------
 *  postData( url, data ) send a post data
 *  Show useful console log 
 *  *return: None
 *-------------------------------*/
function postData( url, data )
{
    fetch(url , {
        credentials: 'include',
        method: 'POST',
        mode: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
          },
        body: JSON.stringify(data)
    }).then(res => res.json()).then((d) => console.log(d));
}

/**-------------------------------
 *   getCookie(name) will get cookie value of given name
 *  
 *  *return: cookie value of related cookie name
 *-------------------------------*/
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            //var cookie = jQuery.trim(cookies[i]);
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showModal( elem )
{
  shadeEl.classList.remove("hidden");
  elem.classList.remove("hidden");
}
/**-------------------------------
 *  closeModal(id) close all modals and overlay.
 *  
 *  *return: None
 *-------------------------------*/
function closeModal()
{
  shadeEl.classList.add("hidden");
  modalDelEl.classList.add("hidden");
  modalEditEl.classList.add("hidden");
}
/**-------------------------------
 *  getElemById(id) Make life a little easier.
 *  Show useful console log on errors
 *  *return: DOM element
 *-------------------------------*/
function getElemById(id)
{
  let result = document.getElementById(id);
  if( !result )
    console.log(` DEBUG WARNING! #${id} element is undefined.`);
  return result;
}

/**-------------------------------
 *  setEvent(id , type, funcName) Make life a little easier.
 *  Set event handler for given id.
 *  Show useful console log on errors
 *  *return: true if succeed
 *-------------------------------*/
function setEvent(id , type, funcName)
{
  let elem = document.getElementById(id);
  if( !elem )
  {
    console.log(` DEBUG WARNING! Eventlistener for #${id} is undefined.`);
    return false;
  }
    elem.addEventListener( type , funcName );
    return true;
}


console.log("JS-LOADED");