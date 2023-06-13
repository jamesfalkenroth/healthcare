// declare variables
let mapOptions = {'center': [34.03303078948834, -118.36281980706895],'zoom':11}
let index = 0;
let dataArray = [];

const boundaryLayer ="ca_zipcodes.geojson"
let boundary; // place holder for the data
let collected; // variable for turf.js collected points 
let allPoints = []; // array for all the data points
let geojson; // place holder for the geojson file we will create

let below20 = L.featureGroup();
let below40 = L.featureGroup();
let below60 = L.featureGroup();
let below80 = L.featureGroup();
let above80 = L.featureGroup();

const ctx = document.getElementById('myChart');

let chart = new Chart(ctx, {
    type: 'pie',
    data: {
            labels: ['FQHC Users', 'FQHC Non-Users'],
            datasets: [{
            label: '# of Respondents',
            data: [1, 1],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {

        }
    }
  });
chart.destroy();

document.getElementById('chartSpace').style.height = 0;


// use the variables
const map = L.map('the_map').setView(mapOptions.center, mapOptions.zoom);

// set basemap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution:
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let layers = {
	"below20 <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='#9ecae1' /></svg>": below20,
	"below40 <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='#6baed6' /></svg>": below40,
    "below60 <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='#4292c6' /></svg>": below60,
    "below80 <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='#2171b5' /></svg>": below80,
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

function addMarker(data){
    // this is the value that will be incremented
    let howMany = data['How many FQHCs have you used before in your primary area of residence?']
    let insurance = data['Do you have health insurance?']
    let income = data['Are you from a low-income household?']
    let story = data['If applicable, what was your experience in using the FQHCs in your primary area of residence?']
    let story2 = data['Do you feel your access to health care has impacted your usage or awareness of FQHCs?']

    // create the turfJS point
    dataArray.push([howMany, insurance, income, story, story2, data['Timestamp']])
    console.log(data['Timestamp']);
    console.log(index);
    let thisPoint = turf.point([Number(data.lng),Number(data.lat)],{index})
    index++;

    // put all the turfJS points into `allPoints`
    allPoints.push(thisPoint)
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

function changeTestimonials(e){
    let indices = e.target.feature.properties.values;
    //sorts array based on average length of responses corresponding to each index in dataArray
    indices = indices.sort(function (a, b) {  return a - b;  });
    console.log(indices);
    let testimonials = document.getElementById("testimonials");

    if(indices.length>0){
        testimonials.innerHTML = `<hr><strong>Testimonials<strong><br/><br/>`;
        addChart(indices);
    }
    else {
        testimonials.innerHTML = "Click on a zip code area to learn about Bruins' experiences with FQHCs.";
        document.getElementById('chartSpace').style.height = 0;
    }

    for(i=0; i<indices.length; i++){
        let timestamp = dataArray[indices[i]][5];
        console.log(timestamp);
        let value = dataArray[indices[i]][0];
        let response3 = dataArray[indices[i]][3];
        let response4 = dataArray[indices[i]][4];

        if(response3.length>5 || response4.length>5){
            if(value=='None' || value=='Unsure/Do not know') {
                testimonials.innerHTML += `<i>FQHC Non-User</i><br/><br/>`
            }
            else if(value=='Many' || value=='A few') {
                testimonials.innerHTML += `<i>FQHC User</i><br/><br/>`
            }

            if(response3.length>5){
                testimonials.innerHTML += `<strong>What was your experience in using the FQHCs in your primary area of residence?</strong><br/>`
                testimonials.innerHTML += `<br/>${response3}<br/><br/>`;
            }

            if(response4.length>5){
                testimonials.innerHTML += `<strong>How has your access to health care impacted your usage or awareness of FQHCs?</strong><br/>`
                testimonials.innerHTML += `<br/>${response4}<br/>`;
            }
            testimonials.innerHTML += `<br/><hr><br/>`;
        }
    }
    
    //map.fitBounds(e.target.getBounds());
}

// function for clicking on polygons
function onEachFeature(feature, layer) {
    layer.on({
        click: changeTestimonials,
        mouseover: highlightFeature,
        mouseout: resetHighlight,
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
        let respondents = feature.properties.values.length;
        if(feature.properties.values.length>0) {
            layer.bindPopup(`<strong><font size="+1">${name}</font></strong><hr># of Respondents: ${respondents}<br/><br/>FQHC Usage Rate: ${text}<br/>Low Income: ${incomeText}<br/>Without Health Insurance: ${insureText}`); //bind the pop up to the number
        }
    }
}

function addChart(indices){
    let num = numUsers(indices);
    chart.destroy();
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
                labels: ['FQHC Users', 'FQHC Non-Users'],
                datasets: [{
                label: '# of Respondents',
                data: [num[0], [num[1]]],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {

            }
        }
      });
      
    document.getElementById('chartSpace').style.height = "30vh";
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
                geojson = L.geoJson(collected,{onEachFeature: onEachFeature,style:function(feature)
                {
                    if (feature.properties.values.length > 0) {
                        let percent = getPercentage(feature)
                        //Add feature to a given layer and assign it a color
                        if(percent[0]<0.2){
                            return {color: "#9ecae1",stroke: true, fillOpacity:0.5};
                        }
                        else if(percent[0]<0.4){
                            return {color: "#6baed6",stroke: true, fillOpacity:0.5};
                        }
                        else if(percent[0]<0.6){
                            return {color: "#4292c6",stroke: true, fillOpacity:0.5};
                        }
                        else if(percent[0]<0.8){
                            return {color: "#2171b5",stroke: true, fillOpacity:0.5};
                        }
                        else{
                            return {color: "#08519c",stroke: true, fillOpacity:0.5};
                        }
                    }
                    else{
                        // make the polygon blend in with basemap if it doesn't have any values
                        return{opacity:0,color:"transparent"}
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

function numUsers(indices){
    let user = 0;
    let nonUser = 0;

    for(i=0; i<indices.length; i++){
        value = dataArray[indices[i]][0];

        if(value=='Many' || value=='A few') {
            user++;
            console.log(dataArray[indices[i]][0])
        }
        else if(value=='None' || value=='Unsure/Do not know') {
            nonUser++;
            console.log(dataArray[indices[i]][0])
        }
    }

    return [user, nonUser];
}

// sets style on hover
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 6,
        fillOpacity: 0.75
    });

    layer.bringToFront();
}

// resets style after hover
function resetHighlight(e) {
    geojson.resetStyle(e.target);
}