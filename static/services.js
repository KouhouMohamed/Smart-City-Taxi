var mymap = L.map('mapProject').setView([33.573109, -7.589843], 13);

var latlngs = [
    [33.608757890333884, -7.6253700256347665],
    [33.582591163939185, -7.6981544494628915],
    [33.53681606773302, -7.640304565429688],
    [33.57644154647939, -7.5608253479003915],
];


var latlngs2 = [
    [33.708757890333884, -7.7253700256347665],
    [33.682591163939185, -7.7981544494628915],
    [33.63681606773302, -7.740304565429688],
    [33.67687060377715, -7.657220458984376],
];


let polygon = L.polygon(latlngs, {
    color: 'red'
}).addTo(mymap);

const areaToKmCarre = (areaPolygone) => {
    let km2 = areaPolygone / 1000000;
    return km2.toFixed(2);
}

const areaFromHAToKmCarre = (areaHA) => {
    let km2 = parseFloat(areaHA) / 100;
    return km2.toFixed(2);
}

// Ray Casting algorithm for checking if a point (marker) lies inside of a polygon:
function isMarkerInsidePolygon(marker, poly) {
    var inside = false;
    var x = marker.getLatLng().lat,
        y = marker.getLatLng().lng;
    for (var ii = 0; ii < poly.getLatLngs().length; ii++) {
        var polyPoints = poly.getLatLngs()[ii];
        for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
            var xi = polyPoints[i].lat,
                yi = polyPoints[i].lng;
            var xj = polyPoints[j].lat,
                yj = polyPoints[j].lng;

            var intersect = ((yi > y) != (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
    }
    console.log("inside => ", inside);
    return inside;
};

// counting number of taxis inside polygone
const countTaxiInsidePolygone = (polygone, taxis) => {
    let count = 0;
    for (let i = 0; i < taxis.length; i++) {
        if (isMarkerInsidePolygon(taxis[i].marker, polygone)) {
            ++count;
        }
    }
    return count;
}


const createPolygoneFromLatLong = (taxis, polygon) => {

    var area = L.GeometryUtil.geodesicArea(polygon.getLatLngs()[0]);
    var readableArea = L.GeometryUtil.readableArea(area, true);
    console.log("taxi count => ", countTaxiInsidePolygone(polygon, taxis))
    console.log("area => ", areaFromHAToKmCarre(readableArea))
    let densityCalcul = countTaxiInsidePolygone(polygon, taxis) / areaFromHAToKmCarre(readableArea);
    console.log("densityCalcul => ", densityCalcul);
    if (polygon.getTooltip()) {
        polygon.unbindTooltip()
    }
    polygon.bindTooltip(
        `<p><b>Densité : </b>${densityCalcul.toFixed(3)} taxi/km²</p>
      <p><b>Area : </b>${areaFromHAToKmCarre(readableArea)} km²</p>
      `, {
            sticky: false,
            permanent: true,
            interactive: false,
            direction: 'center',
            className: 'area-tooltip'
        }).openTooltip();
    return polygon;
}


function toRad(Value) {
    return Value * Math.PI / 180;
}

const distanceBetweenTwoPoints = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}


// k nearest neighbour functions

const distanceTaxisWithClient = (latClt, lngClt,taxis)=>{
    var neigbourTaxis = [];
    let obj={};
    let distance=0.0; //en km
    var x, y;
    if(taxis.length>0){
      for(let i=0;i<taxis.length;i++){
        x=taxis[i].marker.getLatLng().lat;
        y=taxis[i].marker.getLatLng().lng;
        distance = distanceBetweenTwoPoints(latClt,lngClt,x,y);
        obj={
          taxi:taxis[i].marker,
          distance
        };
        neigbourTaxis.push(obj);
      }
      console.log("neabour Taxis =>",neigbourTaxis);
    }
    return neigbourTaxis;
  }

  function compare( a, b ) {
    if ( a.distance < b.distance ){
      return -1;
    }
    if ( a.distance > b.distance ){
      return 1;
    }
    return 0;
  }



  const nearestTaxisMarker = (tableDistances, knn) => {
    let nearest = []
    if(tableDistances.length>0){
      // sorting
      tableDistances.sort(compare);
      console.log('sorted table => ', tableDistances);
      for(let i=0;i<knn;i++){
        if(tableDistances[i]!=null){
          nearest.push(tableDistances[i].taxi);
        }
      }
    }
    return nearest;
  }



export {
    latlngs,
    polygon,
    areaFromHAToKmCarre,
    mymap,
    isMarkerInsidePolygon,
    countTaxiInsidePolygone,
    createPolygoneFromLatLong,
    distanceBetweenTwoPoints,
    distanceTaxisWithClient,
    nearestTaxisMarker
};



// nerest neibour