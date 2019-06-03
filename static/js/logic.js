// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  // console.log(data.features);
});

// Create a function that assigns colors based on magnitude
function getColor(d) {
  return  d > 7  ? 'darkred' :
          d > 6  ? 'red' :
          d > 5  ? 'orangeRed' :
          d > 4  ? 'darkorange' :
          d > 3  ? 'orange' :
          d > 2  ? 'yellow' :
          d > 1  ? 'yellowgreen' :
                  'limegreen';
}

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place, time and magnitude of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "<p>Magnitude: " + feature.properties.mag + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature, 
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag*5,
        fillColor: getColor(feature.properties.mag),
        color: "#000",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.75
        })
    }
  });

  // Send the earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [35.2828, -120.6596],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in the baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Create layer control to add legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          mag = [0, 1, 2, 3, 4, 5, 6, 7],
          labels = [];
      
      // loop through the magnitude intervals and generate a label with a colored square for each interval
      for (var i = 0; i < mag.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(mag[i] + 1) + '"></i> ' +
              mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
      }
      return div;
  };
  
  legend.addTo(myMap);
}