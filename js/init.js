// declare variables
let mapOptions = {'center': [34.0709,-118.444],'zoom':10}

// use the variables
const map = L.map('the_map').setView(mapOptions.center, mapOptions.zoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function addMarker(data){
    // console.log(data)
    // these are the names of our lat/long fields in the google sheets:
    if(data["What is your highest level of educational attainment?"] == "Bachelor's Degree (B.S., B.A., etc.)") {
        L.circleMarker([data.lat,data.lng],{
            radius: 15,
            color: 'green'
        }).addTo(map).bindPopup(`<h2>${data['What is your hometown?']}</h2><h3>${data['What is your highest level of educational attainment?']}</h3>`)
        createButtons(data.lat,data.lng,data['What is your hometown?'],'green')
        return
    }
    else if(data["What is your highest level of educational attainment?"] == "No High School Degree") {
        L.circleMarker([data.lat,data.lng],{
            radius: 15,
            color: 'red'
        }).addTo(map).bindPopup(`<h2>${data['What is your hometown?']}</h2><h3>${data['What is your highest level of educational attainment?']}</h3>`)
        createButtons(data.lat,data.lng,data['What is your hometown?'],'red')
        return
    }
    else if(data["What is your highest level of educational attainment?"] == "High School Degree") {
        L.circleMarker([data.lat,data.lng],{
            radius: 15,
            color: 'yellow'
        }).addTo(map).bindPopup(`<h2>${data['What is your hometown?']}</h2><h3>${data['What is your highest level of educational attainment?']}</h3>`)
        createButtons(data.lat,data.lng,data['What is your hometown?'],'yellow')
        return
    }
    else if(data["What is your highest level of educational attainment?"] == "Graduate Degree") {
        L.circleMarker([data.lat,data.lng],{
            radius: 15,
            color: 'blue'
        }).addTo(map).bindPopup(`<h2>${data['What is your hometown?']}</h2><h3>${data['What is your highest level of educational attainment?']}</h3>`)
        createButtons(data.lat,data.lng,data['What is your hometown?'],'blue')
        return
    }
    else if(data["What is your highest level of educational attainment?"] == "PhD or above") {
        L.circleMarker([data.lat,data.lng],{
            radius: 15,
            color: 'purple'
        }).addTo(map).bindPopup(`<h2>${data['What is your hometown?']}</h2><h3>${data['What is your highest level of educational attainment?']}</h3>`)
        createButtons(data.lat,data.lng,data['What is your hometown?'],'purple')
        return
    }
}

function createButtons(lat,lng,title,color){
    const newButton = document.createElement("button"); // adds a new button
    newButton.id = "button"+title; // gives the button a unique id
    newButton.innerHTML = title; // gives the button a title
    newButton.setAttribute("lat",lat); // sets the latitude 
    newButton.setAttribute("lng",lng); // sets the longitude 
    newButton.addEventListener('click', function(){
        map.flyTo([lat,lng]); //this is the flyTo from Leaflet
    })
    if(color=='red'){
        newButton.style.color='red';
        newButton.style.background='white';
        const spaceForButtons = document.getElementById('placeForRedButtons');
        spaceForButtons.appendChild(newButton);//this adds the button to our page.
    }
    else if(color=='green'){
        newButton.style.color='green';
        newButton.style.background='white';
        const spaceForButtons = document.getElementById('placeForGreenButtons')
        spaceForButtons.appendChild(newButton);//this adds the button to our page.
    }
    else if(color=='blue'){
        newButton.style.color='blue';
        newButton.style.background='white';
        const spaceForButtons = document.getElementById('placeForBlueButtons')
        spaceForButtons.appendChild(newButton);//this adds the button to our page.
    }
    else if(color=='purple'){
        newButton.style.color='purple';
        newButton.style.background='white';
        const spaceForButtons = document.getElementById('placeForPurpleButtons')
        spaceForButtons.appendChild(newButton);//this adds the button to our page.
    }
    else if(color=='yellow'){
        newButton.style.color='gold';
        newButton.style.background='white';
        const spaceForButtons = document.getElementById('placeForYellowButtons')
        spaceForButtons.appendChild(newButton);//this adds the button to our page.
    }
}

const dataUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSEcGaieNJJaf1Fkh0pwp8hvhnHYJJzV2TnCXHU8pBEWveti9_LuiZFZ7oAytgNcy0mrDJLKLs1HU-j/pub?output=csv"

function loadData(url){
    Papa.parse(url, {
        header: true,
        download: true,
        complete: results => processData(results)
    })
}

function processData(results){
    console.log(results)
    results.data.forEach(data => {
        console.log(data)
        addMarker(data)
    })
}

loadData(dataUrl)
