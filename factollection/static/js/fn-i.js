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
const ENUMRADIO = ["all", "trivia", "math", "date"];
/*----- app's state (variables) -------------------------------------*/
let radioSelector = "trivia";
/*----- cached element references -----------------------------------*/
const subjectEl = getElemById("subject");
const radioEls = document.querySelectorAll(".tab");
const dataEl = getElemById("data-facts");
//console.log(dataEl.getAttribute("data"));
const formEl = getElemById("add-fact");
const factSaveEl = getElemById("fact-to-save");
const factResEl = getElemById("fact-res");
/*----- event listeners -----------------------------------------------------*/
setEvent("go-btn", "click", makeRequest );
setEvent("subject", "input",subjectChanged);
setEvent("subject", "focus",subjectFocused);
radioEls.forEach(tab=>{setEvent(tab.id,"click", radioClicked);});
setEvent("save-fact", "click", saveClicked);
/*----- functions -----------------------------------------------------------------*/ 
/**-------------------------------
 *  showNextFact() Will be run 
 *  * event handler
 *  * return : none
 *-------------------------------*/
function saveClicked()
{
  console.log("SAVE -->");
  factSaveEl.value = factResEl.innerText;
  //formEl.submit();
  let final = factResEl.innerText+'/';
 // final += factResEl.innerText + '/';
  postData("/add/"+final, final);
}
/**-------------------------------
 *  makeRequest() Will be run when Go is clicked
 *  * event handler
 *  * return : send a post request besed on radios and subject
 *-------------------------------*/
function makeRequest() //BUG STRENG
{
 let subject = subjectEl.value;
 let selected = radioSelector;

 if(selected === "all") // this means type should be randomly selected
 {
     if ( isNaN( subject ) || ! subject ) 
        selected = ENUMRADIO [ Math.floor( Math.random() * 3 ) +1];
     else
        selected = ENUMRADIO [ Math.floor(Math.random()*2) +1] ;
 }
 if( ! subject  )
    if (selected != "date")
        subject = Math.floor( Math.random() * 1000 );
    else
    {
        subject = Math.floor( Math.random() * 11 ) +1;
        subject = subject.toString() + '/' + Math.floor( Math.random() * 30 );   
    }

  subject = selected + ":" + subject ;
  postData("/index/", subject);  
  console.log( subject, "<---Subject to POST");
}    

/**-------------------------------
 *  subjectChanged() process and filter subject entry based on radios
 *  * event handler
 *  * return : none
 *-------------------------------*/
function subjectChanged()
{
    let value = subjectEl.value;
    let n = value.length-1;
    let newChar = value.charAt( n );

    if(radioSelector !== "date")
    {
        if( isNaN(newChar) )
            subjectEl.value = value.slice(0, -1);
    }
    else // user is in date entry mode
    {
        if(n > 4)
        {
            subjectEl.value = value.slice(0, -1);
            return;
        }
        switch (n)
        {
            case 0: 
                if( isNaN(newChar) )
                    subjectEl.value = value.slice(0, -1);
            break;
            case 1:
                if( isNaN(newChar) || parseInt(newChar)>2 )
                    subjectEl.value = value.slice(0, -1);
                else
                    subjectEl.value += '/';    
                if(newChar === '/')
                    subjectEl.value = '0' + subjectEl.value + '/';
            break ; 
            case 3:
                if( isNaN(newChar) )
                    subjectEl.value = value.slice(0, -1);
            break;
            case 4:
                if( isNaN(newChar) || ( parseInt(subjectEl.value[n-1]) > 2 && parseInt(newChar) > 1 ))
                    subjectEl.value = value.slice(0, -1);
            break;        
        }
    }
    
} 
/**-------------------------------
 *  subjectChanged() process and filter subject entry based on radios
 *  * event handler
 *  * return : none
 *-------------------------------*/
function subjectFocused()
{
    if(radioSelector === "date")
    {
        subjectEl.value = "dd/mm";
        subjectEl.select();
    }
    console.log("HALA");
} 

/**-------------------------------
 *  radioClicked() Will be run when a tab is clicked
 *  * event handler
 *  * return : send a post request besed on radios and subject
 *-------------------------------*/
function radioClicked(e)
{
    radioEls.forEach(tab=>{ tab.classList.remove("selected") });
    let selectedElem = getElemById(e.target.id);
    selectedElem.classList.add("selected");
    radioSelector = selectedElem.id;
    subjectEl.value = "";
    subjectEl.select();
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

console.log("JS LOADED");
