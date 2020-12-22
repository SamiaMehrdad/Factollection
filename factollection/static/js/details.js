// Cached elem
const noteSaveLinkEl = document.getElementById("save")




// Event listeners
noteSaveLinkEl.addEventListener("click", function(){addNoteToHref()})





function addNoteToHref() {
    const userNote = document.getElementById("fact-note").value
    console.log('addNoteToHref dun ran')
    href = noteSaveLinkEl.getAttribute("href")
    href = href + userNote
    console.log(href)
    noteSaveLinkEl.setAttribute('href', href)
}