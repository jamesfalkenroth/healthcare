// declare variables
let mapOptions = {'center': [34.0709,-118.444],'zoom':11}
let index = 0;
let dataArray = [];

const boundaryLayer ="ca_zipcodes.geojson"
let boundary; // place holder for the data
let collected; // variable for turf.js collected points 
let allPoints = []; // array for all the data points

let below20 = L.featureGroup();
let below40 = L.featureGroup();
let below60 = L.featureGroup();
let below80 = L.featureGroup();
let above80 = L.featureGroup();

// use the variables
const map = L.map('the_map').setView(mapOptions.center, mapOptions.zoom);

// set basemap
var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});

Stadia_AlidadeSmoothDark.addTo(map);

let layers = {
	"below20 <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='#eff3ff' /></svg>": below20,
	"below40 <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='#bdd7e7' /></svg>": below40,
    "below60 <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='#6baed6' /></svg>": below60,
    "below80 <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='#3182bd' /></svg>": below80,
    "above80 <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='#08519c' /></svg>": above80
}

let circleOptions = {
    radius: 4,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 0,
    fillOpacity: 0
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
    let insurance = data['Do you have health insurance?']
    let income = data['Are you from a low-income household?']
    let story = data['If applicable, what was your experience in using the FQHCs in your primary area of residence?']
    let story2 = data['Do you feel your access to health care has impacted your usage or awareness of FQHCs?']

    // create the turfJS point
    dataArray.push([howMany, insurance, income, story, story2])
    let thisPoint = turf.point([Number(data.lng),Number(data.lat)],{index})
    index++;
    // put all the turfJS points into `allPoints`
    allPoints.push(thisPoint)
    /*if(data['How many FQHCs have you used before in your primary area of residence?'] == "Many"){
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
    }*/
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
    /*many.addTo(map) // add our layers after markers have been made
    aFew.addTo(map) // add our layers after markers have been made  
    none.addTo(map) // add our layers after markers have been made
    unsure.addTo(map) // add our layers after markers have been made
    let allLayers = L.featureGroup([many,aFew,none,unsure]);
    map.fitBounds(allLayers.getBounds());*/

        //below20.addTo(map) // add our layers after polygons have been made
    /*below40.addTo(map)
    below60.addTo(map)
    below80.addTo(map)
    above80.addTo(map)
    let allLayers = L.featureGroup([below20,below40,below60,below80,above80]);
    map.fitBounds(allLayers.getBounds());*/


    // step 1: turn allPoints into a turf.js featureCollection
    thePoints = turf.featureCollection(allPoints)

    // step 2: run the spatial analysis
    getBoundary(boundaryLayer)
}

loadData(dataUrl)

// function to open the survey in a new tab
function openSurvey() {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSfUnx5si5g-bz0nCHcXjXOBrcFNm0RvnTi1q4V9_GMs6p3SWQ/viewform?usp=sf_link", "_blank");
}

// sets survey to invisible
// document.getElementById("theSurvey").style.display = "none";

// function to hide and show the survey with a button
/*function showSurvey() {
    var survey = document.getElementById("theSurvey");
    if (survey.style.display === "none") {
      survey.style.display = "block";
    } else {
      survey.style.display = "none";
    }
}*/

function changeTestimonials(e){
    let indices = e.target.feature.properties.values;
    let testimonials = document.getElementById("testimonials");

    if(indices.length>0){
        testimonials.innerHTML = "";
        //document.getElementById("story_area").style.height = 30vh;
    }
    else {
        testimonials.innerHTML = "Click on a zip code area to show stories.";
    }

    for(i=0; i<indices.length; i++){
        console.log(dataArray[indices[i]]);
        let value = dataArray[indices[i]][0];
        if(value=='None' || value=='Unsure/Do not know') {
            testimonials.innerHTML += `<i>FQHC Non-User</i><br/><br/>`
        }
        else if(value=='Many' || value=='A few') {
            testimonials.innerHTML += `<i>FQHC User</i><br/><br/>`
        }

        let response3 = dataArray[indices[i]][3];
        if(response3.length>5){
            testimonials.innerHTML += `<strong>What was your experience in using the FQHCs in your primary area of residence?</strong><br/>`
            testimonials.innerHTML += `${response3}<br/><br/>`;
        }

        let response4 = dataArray[indices[i]][4];
        if(response4.length>5){
            testimonials.innerHTML += `<strong>How has your access to health care impacted your usage or awareness of FQHCs?</strong><br/>`
            testimonials.innerHTML += `${response4}<br/>`;
        }
        testimonials.innerHTML += `<br/><br/>`;
    }
    
    //map.fitBounds(e.target.getBounds());
}

// function for clicking on polygons
function onEachFeature(feature, layer) {
    layer.on({
        click: changeTestimonials
    });
    if (feature.properties.values) {
        let percentages = getPercentage(feature)
        // count the values within the polygon by using .length on the values array created from turf.js collect
        let awarePerc = Math.round(percentages[0]*100);
        let lowIncPerc = Math.round(percentages[1]*100);
        let uninsuredPerc = Math.round(percentages[2]*100);


        let text = awarePerc.toString() + "%"; // convert it to a string
        let incomeText = lowIncPerc.toString() + "%";
        let insureText = uninsuredPerc.toString() + "%";

        let name = feature.properties.zcta;
        if(feature.properties.values.length>0) {
            layer.bindPopup(`<strong>${name}</strong><br/>FQHC Usage Rate: ${text}<br/>Low Income: ${incomeText}<br/>Without Health Insurance: ${insureText}`); //bind the pop up to the number
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
                collected = turf.collect(boundary, thePoints, 'index', 'values');
                // just for fun, you can make buffers instead of the collect too:
                // collected = turf.buffer(thePoints, 50,{units:'miles'});

                // here is the geoJson of the `collected` result:
                L.geoJson(collected,{onEachFeature: onEachFeature,style:function(feature)
                {
                    if (feature.properties.values.length > 0) {
                        let percent = getPercentage(feature)
                        //Add feature to a given layer and assign it a color
                        if(percent[0]<0.2){
                            return {color: "Blue",stroke: true, fillOpacity:0.5};
                        }
                        else if(percent[0]<0.4){
                            return {color: "Green",stroke: true, fillOpacity:0.5};
                        }
                        else if(percent[0]<0.6){
                            return {color: "Red",stroke: true, fillOpacity:0.5};
                        }
                        else if(percent[0]<0.8){
                            return {color: "Yellow",stroke: true, fillOpacity:0.5};
                        }
                        else{
                            return {color: "LightSkyBlue",stroke: true, fillOpacity:0.5};
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
    let lowIncome = 0;
    let notLowIncome = 0;
    let insured = 0;
    let uninsured = 0;
    for(i=0; i<feature.properties.values.length; i++){
        console.log(feature.properties);
        value = dataArray[feature.properties.values[i]][0];

        if(value=='Many' || value=='A few') {
            user++;
            console.log(dataArray[feature.properties.values[i]][0])
        }
        else if(value=='None' || value=='Unsure/Do not know') {
            nonUser++;
            console.log(dataArray[feature.properties.values[i]][0])
        }

        insuranceStatus = dataArray[feature.properties.values[i]][1]
        if(insuranceStatus=='Yes'){
            insured++;
        }
        else if(insuranceStatus=='No'){
            uninsured++;
        }

        incomeStatus = dataArray[feature.properties.values[i]][2]
        if(incomeStatus=='Yes'){
            lowIncome++;
        }
        else if(incomeStatus=='No'){
            notLowIncome++;
        }
    }
    let percentage = [user/(user+nonUser),lowIncome/(lowIncome+notLowIncome),uninsured/(insured+uninsured)];
    return percentage;
}