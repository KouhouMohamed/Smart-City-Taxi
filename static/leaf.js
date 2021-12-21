  import { latlngs,
           polygon,
           areaFromHAToKmCarre,
           mymap,
           isMarkerInsidePolygon,
           countTaxiInsidePolygone,
           createPolygoneFromLatLong,
           distanceBetweenTwoPoints,
           distanceTaxisWithClient,
           nearestTaxisMarker
          } from './services.js'
  // var mymap = L.map('mapProject').setView([33.573109, -7.589843], 10);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoibWVoZGktbWVrb3VhciIsImEiOiJja29sY2t4dTUwMTJnMm9zM2pydjMzdnV4In0.n3T-PUuEZu8UW29h7RptNg' //ENTER YOUR ACCESS TOKEN HERE
  }).addTo(mymap);

  var taxis = [];
  var clients = [];
  var mesureMap = 0.000000000333333


  //************************************************************************ */
  //                    our lestner
  //************************************************************************ */
  var source = new EventSource('/topic/GPS');
  source.addEventListener('message', function (e) {


    let str = e.data.replace(/'/g, "\"").replace(/"{/g, "{").replace(/}"/g, "}").replace(/\\"/g, "");
    var obj = JSON.parse(str);
    console.log('latitude => ', obj.payload.accX)
    console.log('longitude => ', obj.payload.accY)
    
    // marker taxi
    var taxiMarker = L.icon({
      iconUrl: 'https://static.thenounproject.com/png/886623-200.png',
      iconSize: [58, 60], // size of the icon
      iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
      popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    // client marker
    var clientMarker = L.icon({
      iconUrl: 'https://autouplinkse.com/wp-content/uploads/2018/11/Facebook-Marketplace-Customer-Icon.png',
      iconSize: [48, 65], // size of the icon
      shadowSize: [50, 64], // size of the shadow
      iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
      popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });


    // popup taxis et clients
    const popupTaxiClient = (content, lat, long) => {
      var latlng = L.latLng(lat, long);
      return L.popup()
        .setLatLng(latlng)
        .setContent(content)
        .openOn(mymap);
    } 
    
    // pour les taxis
    if (obj && obj.payload.type === "TAXI") {
      let content;
      for (let i = 0; i < taxis.length; i++) {
        if (taxis[i].id === obj.payload.Sensor_ID) {
          content = taxis[i].marker.getPopup().getContent();
          mymap.removeLayer(taxis[i].marker);
          taxis.splice(i, 1);
        }
      }
      let dataTaxiMarker = L.marker([obj.payload.accX, obj.payload.accY], {
        icon: taxiMarker
      }).addTo(mymap);
      mymap.flyTo([obj.payload.accX, obj.payload.accY], 13)
      
      if(content){
        dataTaxiMarker.bindPopup(popupTaxiClient(content, obj.payload.accX, obj.payload.accY)).openPopup();
      }else{
        dataTaxiMarker.bindPopup(popupTaxiClient(`<p><b>TAXI</b><br/> ${obj.payload.Sensor_ID}</p>`, obj.payload.accX, obj.payload.accY)).openPopup();
      }
      let location = {
        id: obj.payload.Sensor_ID,
        marker: dataTaxiMarker
      };
      taxis.push(location);
      createPolygoneFromLatLong(taxis,polygon);
    }




    // pour les clients
    if (obj && obj.payload.type === "CLIENT") {
      for (let i = 0; i < clients.length; i++) {
        if (clients[i].id === obj.payload.Sensor_ID) {
          mymap.removeLayer(clients[i].marker);
          clients.splice(i, 1);
        }
      }
      let dataClientMarker = L.marker([obj.payload.accX, obj.payload.accY], {
        icon: clientMarker
      }).addTo(mymap);
      mymap.flyTo([obj.payload.accX, obj.payload.accY], 13)
      var taxisNearest;
      // dataClientMarker.bindPopup(popup).openPopup();
      dataClientMarker.bindPopup(popupTaxiClient(`<p><b>CLIENT</b><br/> ${obj.payload.Sensor_ID}</p>`, obj.payload.accX, obj.payload.accY)).openPopup();
      taxisNearest = nearestTaxisMarker(distanceTaxisWithClient(obj.payload.accX, obj.payload.accY,taxis),1)
      console.log("from client conditions nearests are => ",taxisNearest)
      if(taxisNearest.length>0){
        var popup = taxisNearest[0].getPopup();
        var content = popup.getContent().split(',')[0];
        popup.setContent(`${content},<p class="text-white bg-success"><b>Near to :</b>${obj.payload.Sensor_ID}</p>`);
        console.log("content popup => ",content);
      }
      let location = {
        id: obj.payload.Sensor_ID,
        marker: dataClientMarker
      };
      clients.push(location);
    }

  }, false);