// declare variables
let mapOptions = {'center': [34.0709,-118.444],'zoom':10}

// use the variables
const map = L.map('the_map').setView(mapOptions.center, mapOptions.zoom);

let Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});

Esri_WorldGrayCanvas.addTo(map);

function addMarker(data){
    // console.log(data)
    // these are the names of our lat/long fields in the google sheets:
    if(data["How many FQHCs have you used before in your primary area of residence?"] == "Many") {
        L.circleMarker([data.lat,data.lng],{
            radius: 10,
            color: 'green'
        }).addTo(map).bindPopup(`<h2>${data['Where is your primary zip code of residence?']}</h2><h3>${data["How many FQHCs have you used before in your primary area of residence?"]}</h3>`)
        return
    }
    else if(data["How many FQHCs have you used before in your primary area of residence?"] == "A few") {
        L.circleMarker([data.lat,data.lng],{
            radius: 10,
            color: 'yellow'
        }).addTo(map).bindPopup(`<h2>${data['Where is your primary zip code of residence?']}</h2><h3>${data["How many FQHCs have you used before in your primary area of residence?"]}</h3>`)
        return
    }
    else if(data["How many FQHCs have you used before in your primary area of residence?"] == "None") {
        L.circleMarker([data.lat,data.lng],{
            radius: 10,
            color: 'red'
        }).addTo(map).bindPopup(`<h2>${data['Where is your primary zip code of residence?']}</h2><h3>${data["How many FQHCs have you used before in your primary area of residence?"]}</h3>`)
        return
    }
    else {
        L.circleMarker([data.lat,data.lng],{
            radius: 10,
            color: 'gray'
        }).addTo(map).bindPopup(`<h2>${data['Where is your primary zip code of residence?']}</h2><h3>${data["How many FQHCs have you used before in your primary area of residence?"]}</h3>`)
        return
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

//sets survey to invisible
document.getElementById("theSurvey").style.display = "none";

//function to hide and show the survey with a button
function showSurvey() {
    var survey = document.getElementById("theSurvey");
    if (survey.style.display === "none") {
      survey.style.display = "block";
    } else {
      survey.style.display = "none";
    }
}

//function for clicking on polygons
function onEachFeature(feature, layer) {
    console.log(feature.properties)
    if (feature.properties.values) {
        //count the values within the polygon by using .length on the values array created from turf.js collect
        let count = feature.properties.values.length
        console.log(count) // see what the count is on click
        let text = count.toString() // convert it to a string
        layer.bindPopup(text); //bind the pop up to the number
    }
}

// new function to get the boundary layer and add data to it with turf.js
function getBoundary(layer){
    fetch(layer)
    .then(response => {
        return response.json();
        })
    .then(data =>{
                //set the boundary to data
                boundary = data

                // run the turf collect geoprocessing
                collected = turf.collect(boundary, thePoints, 'speakEnglish', 'values');
                // just for fun, you can make buffers instead of the collect too:
                // collected = turf.buffer(thePoints, 50,{units:'miles'});
                console.log(collected.features)

                // here is the geoJson of the `collected` result:
                L.geoJson(collected,{onEachFeature: onEachFeature,style:function(feature)
                {
                    console.log(feature)
                    if (feature.properties.values.length > 0) {
                        return {color: "#ff0000",stroke: false};
                    }
                    else{
                        // make the polygon gray and blend in with basemap if it doesn't have any values
                        return{opacity:0,color:"#efefef" }
                    }
                }
                // add the geojson to the map
                    }).addTo(map)
        }
    )   
}