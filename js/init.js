// declare variables
let mapOptions = {'center': [34.0709,-118.444],'zoom':10}

const boundaryLayer = "ca_zipcodes.geojson"
let boundary; // place holder for the data
let collected; // variable for turf.js collected points 
let allPoints = []; // array for all the data points

let many = L.featureGroup();
let aFew = L.featureGroup();
let none = L.featureGroup();
let unsure = L.featureGroup();

// use the variables
const map = L.map('the_map').setView(mapOptions.center, mapOptions.zoom);

// set basemap
let Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});

Esri_WorldGrayCanvas.addTo(map);

let layers = {
	"Many used <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='green' /></svg>": many,
	"A few used <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='red' /></svg>": aFew,
    "None used <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='red' /></svg>": none,
    "Unsure how many used <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='red' /></svg>": unsure
}

let circleOptions = {
    radius: 4,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

// for coloring the polygon
function getStyles(data){
    let myStyle = {
        "color": "#ff7800",
        "weight": 1,
        "opacity": .0,
        "stroke": 0.5
    };
    if (data.properties.values.length > 0){
        myStyle.opacity = 0
        
    }
    return myStyle
}

function addMarker(data){
    // this is the value that will be incremented
    let howMany = data['How many FQHCs have you used before in your primary area of residence?']
    // create the turfJS point
    let thisPoint = turf.point([Number(data.lng),Number(data.lat)],{howMany})
    // put all the turfJS points into `allPoints`
    allPoints.push(thisPoint)
    if(data['How many FQHCs have you used before in your primary area of residence?'] == "Many"){
        circleOptions.fillColor = "green"
        many.addLayer(L.circleMarker([data.lat,data.lng],circleOptions).bindPopup(`<h2>Many used</h2>`))
        }
    else if(data['How many FQHCs have you used before in your primary area of residence?'] == "A few"){
        circleOptions.fillColor = "yellow"
        aFew.addLayer(L.circleMarker([data.lat,data.lng],circleOptions).bindPopup(`<h2>A few used</h2>`))
    }
    else if(data['How many FQHCs have you used before in your primary area of residence?'] == "None"){
        circleOptions.fillColor = "red"
        none.addLayer(L.circleMarker([data.lat,data.lng],circleOptions).bindPopup(`<h2>None used</h2>`))
    }
    else {
        circleOptions.fillColor = "gray"
        unsure.addLayer(L.circleMarker([data.lat,data.lng],circleOptions).bindPopup(`<h2>Unsure how many used</h2>`))
    }
    return data
};

const dataUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSEcGaieNJJaf1Fkh0pwp8hvhnHYJJzV2TnCXHU8pBEWveti9_LuiZFZ7oAytgNcy0mrDJLKLs1HU-j/pub?output=csv"

function loadData(url){
    Papa.parse(url, {
        header: true,
        download: true,
        complete: results => processData(results)
    })
}

function processData(results){
    results.data.forEach(data => {
        addMarker(data)
    })
    many.addTo(map) // add our layers after markers have been made
    aFew.addTo(map) // add our layers after markers have been made  
    none.addTo(map) // add our layers after markers have been made
    unsure.addTo(map) // add our layers after markers have been made
    let allLayers = L.featureGroup([many,aFew,none,unsure]);
    map.fitBounds(allLayers.getBounds());

    // step 1: turn allPoints into a turf.js featureCollection
    thePoints = turf.featureCollection(allPoints)

    // step 2: run the spatial analysis
    getBoundary(boundaryLayer)
}

loadData(dataUrl)

// sets survey to invisible
document.getElementById("theSurvey").style.display = "none";

// function to hide and show the survey with a button
function showSurvey() {
    var survey = document.getElementById("theSurvey");
    if (survey.style.display === "none") {
      survey.style.display = "block";
    } else {
      survey.style.display = "none";
    }
}

// function for clicking on polygons
function onEachFeature(feature, layer) {
    if (feature.properties.values) {
        // count the values within the polygon by using .length on the values array created from turf.js collect
        let percentage = getPercentage(feature)*100;
        let text = percentage.toString() + "%"; // convert it to a string
        if(feature.properties.values.length>0) {
            layer.bindPopup(text); //bind the pop up to the number
        }
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
                collected = turf.collect(boundary, thePoints, 'howMany', 'values');
                // just for fun, you can make buffers instead of the collect too:
                // collected = turf.buffer(thePoints, 50,{units:'miles'});

                // here is the geoJson of the `collected` result:
                L.geoJson(collected,{onEachFeature: onEachFeature,style:function(feature)
                {
                    if (feature.properties.values.length > 0) {
                        if(getPercentage(feature)>0.5){
                            return {color: "Blue",stroke: true};
                        }
                        else{
                            return {color: "LightSkyBlue",stroke: true};
                        }
                    }
                    else{
                        // make the polygon gray and blend in with basemap if it doesn't have any values
                        return{opacity:0,color:"#efefef"}
                    }
                }
                // add the geojson to the map
                    }).addTo(map)
        }
    )   
}

function getPercentage(feature){
    let user = 0;
    let nonUser = 0;
    for(i=0; i<feature.properties.values.length; i++){
        console.log(feature.properties.values[i])
        if(feature.properties.values[i]=='Many' || feature.properties.values[i]=='A few') {
            user++;
        }
        if(feature.properties.values[i]=='None' || feature.properties.values[i]=='Unsure/Do not know') {
            nonUser++;
        }
    }
    let percentage = user/(user+nonUser);
    return percentage;
}