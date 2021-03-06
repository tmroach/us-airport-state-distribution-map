// 1. Create a map object.
var mymap = L.map('map', {
    center: [40.26096347942603, -100.34589762517666],
    zoom: 4,
    maxZoom: 10,
    minZoom: 3,
    detectRetina: true // detect whether the sceen is high resolution or not.
});

// 2. Add a base map.
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(mymap);

// 3. Add airport GeoJSON Data
// Null variable that will hold airport data
var airports = null;

// 4. build up a set of colors from colorbrewer's dark2 category
var colors = chroma.scale('Set2').mode('lch').colors(13);

// 5. dynamically append style classes to this page. This style classes will be used for colorize the markers.
for (i = 0; i < 13; i++) {
    $('head').append($("<style> .marker-color-" + (i + 1).toString() + " { color: " + colors[i] + "; font-size: 15px; text-shadow: 0 0 3px #ffffff;} </style>"));
}

airports = L.geoJson.ajax("assets/airports.geojson", {
    onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.AIRPT_NAME);
    },
    pointToLayer: function (feature, latlng) {
        if (feature.properties.CNTL_TWR == 'N') {
          // designate airports without air traffic control as a plane icon
          return L.marker(latlng, {icon: L.divIcon({className: 'fas fa-plane' })});
        }
        // designate airports with air traffic control as a broadcast tower icon
        return L.marker(latlng, {icon: L.divIcon({className: 'fas fa-broadcast-tower' })});
    },
    attribution: 'Airport Data &copy; data.gov | US States &copy; Mike Bostock of D3 | Base Map &copy; CartoDB | Made By Tim Roach'

}).addTo(mymap);

// create the state layer
L.geoJson.ajax("assets/us-states.geojson").addTo(mymap);

// 6. Set function for color ramp
colors = chroma.scale('PuBuGn').colors(5);

// define which values should fit in a bin for the choropleth map
function setColor(density) {
    var id = 0;
    if (density > 100) { id = 4; }
    else if (density > 40 && density <= 99) { id = 3; }
    else if (density > 11 && density <= 39) { id = 2; }
    else if (density > 1 &&  density <= 10) { id = 1; }
    else  { id = 0; }
    return colors[id];
}

// 7. Set style function that sets fill color.md property equal to airport count
function style(feature) {
    return {
        fillColor: setColor(feature.properties.count),
        fillOpacity: 0.4,
        weight: 2,
        opacity: 1,
        color: '#b4b4b4',
        dashArray: '4'
    };
}

// 8. Add state polygons
L.geoJson.ajax("assets/us-states.geojson", {
    style: style
}).addTo(mymap);

// 9. Create Leaflet Control Object for Legend
var legend = L.control({position: 'topright'});

// 10. Function that runs when legend is added to map
legend.onAdd = function () {

    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b># Airports per US State</b><br />';
    div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.5"></i><p> 150+ </p>';
    div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.5"></i><p> 40-99 </p>';
    div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.5"></i><p> 11-39 </p>';
    div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.5"></i><p> 1-10 </p>';
    div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.5"></i><p> 0 </p>';
    div.innerHTML += '<hr><b>Company<b><br />';
    div.innerHTML += '<i class="fas fa-broadcast-tower"></i><p> Has Air Traffic Control </p>';
    div.innerHTML += '<i class="fas fa-plane"></i><p> No Air Traffic Control </p>';

    // Return the Legend div containing the HTML content
    return div;
};

// 11. Add a legend to map
legend.addTo(mymap);

// 12. Add a scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(mymap);
