
function circleColor(mag){
    if (mag >= 6){
        return "red";
    }
    else if (mag >= 5){
        return "orange";
    }
    else if (mag >= 4){
        return "yellow";
    }
    else if (mag >= 3){
        return "green";
    }
    else if (mag >= 2){
        return "blue";
    }
    else if (mag >= 1){
        return 'indigo'
    }
};

function createMarker(feature,latlng){
    var options =  {
        radius:(feature.properties.mag*4),
        fillColor: circleColor(feature.properties.mag),
        color: "#000000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    }
    return L.circleMarker( latlng, options );
}

function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>" + "Time: " + new Date(feature.properties.time) + "<br></br>" 
    + "Magnitude: "+ feature.properties.mag + "</p>"
    );
}

function createFeatures(earthquakeData) {

 
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
		pointToLayer: createMarker
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
    
     
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    const streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.streets",
            accessToken: API_KEY
    });

    const darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.dark",
            accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
            "Street Map": streetmap,
            "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
            Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
    }).addTo(myMap);

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
    grades = [7,6,5,4,3,2],
    labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + circleColor(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}

return div;
};

legend.addTo(myMap);

    
}

(async function(){
    const queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
    console.log(queryUrl); 
    const data = await d3.json(queryUrl);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
})()
