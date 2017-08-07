(function (){
  /**
   * Elements that make up the popup.
   */
  var contentLeft = document.getElementById('infos-left-content');
  var contentRight = document.getElementById('infos-right-content');

  /**
   * Create layer with bounding box
   */
  var areaLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: function (feature) {
      return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: "blue",
          lineDash: [10],
          width: 3
        }),
        fill: false
      });
    }
  });

  /**
   * Create layer with data
   */
  var vectorLayerLeft = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: function (feature) {
      var fill = new ol.style.Fill({
        color: 'rgba(255,255,255,0.2)'
      });
      var stroke = new ol.style.Stroke({
        color: '#3399CC',
        width: 2
      });
      return [
        new ol.style.Style({
          image: new ol.style.Circle({
            fill: fill,
            stroke: stroke,
            radius: 8
          }),
          fill: fill,
          stroke: stroke
        })
      ];
    }
  });
  var vectorLayerRight = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: function (feature) {
      var fill = new ol.style.Fill({
        color: 'rgba(255,255,255,0.2)'
      });
      var stroke = new ol.style.Stroke({
        color: '#3399CC',
        width: 2
      });
      return [
        new ol.style.Style({
          image: new ol.style.Circle({
            fill: fill,
            stroke: stroke,
            radius: 8
          }),
          fill: fill,
          stroke: stroke
        })
      ];
    }
  });

  /**
   * Create view (same view for both maps)
   */
  var view = new ol.View({
    center: ol.proj.fromLonLat([37.41, 8.82]),
    zoom: 4
  });

  /**
   * Create map left (GeoJSON)
   */
  var mapLeft = new ol.Map({
    controls: ol.control.defaults({attribution: false}).extend([ new ol.control.Attribution({collapsible: false}) ]),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM({
          url: "//tile.openstreetmap.be/osmbe/{z}/{x}/{y}.png",
          attributions: [ ol.source.OSM.ATTRIBUTION, "Tiles courtesy of <a href=\"https://geo6.be/\">GEO-6</a>" ]
        })
      }),
      areaLayer,
      vectorLayerLeft
    ],
    target: "map-left",
    view: view
  });
  /**
   * Add a click handler to the left map to render the popup.
   */
   mapLeft.on("singleclick", function (event) {
     var feature = mapLeft.forEachFeatureAtPixel(event.pixel, function (feature) {
       return feature;
     }, {
       layerFilter: function (layer) {
         return layer === vectorLayerLeft;
       }
     });

     while (contentLeft.hasChildNodes()) {
       contentLeft.removeChild(contentLeft.lastChild);
     }

     if (typeof feature !== "undefined") {
       var table = document.createElement("table");
       var tbody = document.createElement("tbody");

       table.className = "table table-bordered table-sm";
       table.appendChild(tbody);

       var properties = feature.getProperties();
       for (prop in properties) {
         if (prop === feature.getGeometryName()) {
           continue;
         }

         let tr = document.createElement("tr");
         let th = document.createElement("th");
         let td = document.createElement("td");

         tbody.appendChild(tr);
         tr.appendChild(th);
         tr.appendChild(td);

         th.innerText = prop;
         td.innerText = properties[prop];
       };

       contentLeft.appendChild(table);
     }
   });
  /**
   * Add a pointermove handler to the left map to change cursor will hovering an object
   */
  mapLeft.on("pointermove", function (event) {
    if (event.dragging) {
      return;
    }
    var pixel = mapLeft.getEventPixel(event.originalEvent);
    var hit = mapLeft.hasFeatureAtPixel(pixel, {
      layerFilter: function (layer) {
        return layer === vectorLayerLeft;
      }
    });
    document.getElementById("map-left").style.cursor = hit ? 'pointer' : 'default';
  });

  /**
   * Create map right (OSM)
   */
  var mapRight = new ol.Map({
    controls: ol.control.defaults({attribution: false}).extend([ new ol.control.Attribution({collapsible: false}) ]),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM({
          url: "//tile.openstreetmap.be/osmbe/{z}/{x}/{y}.png",
          attributions: [ ol.source.OSM.ATTRIBUTION, "Tiles courtesy of <a href=\"https://geo6.be/\">GEO-6</a>" ]
        })
      }),
      areaLayer,
      vectorLayerRight
    ],
    target: "map-right",
    view: view
  });
  /**
   * Add a click handler to the right map to render the popup.
   */
  mapRight.on("singleclick", function (event) {
    var feature = mapRight.forEachFeatureAtPixel(event.pixel, function (feature) {
      return feature;
    }, {
      layerFilter: function (layer) {
        return layer === vectorLayerRight;
      }
    });

    while (contentRight.hasChildNodes()) {
      contentRight.removeChild(contentRight.lastChild);
    }

    if (typeof feature !== "undefined") {
      var table = document.createElement("table");
      var tbody = document.createElement("tbody");

      table.className = "table table-bordered table-sm";
      table.appendChild(tbody);

      var properties = feature.getProperties();
      for (prop in properties) {
        if (prop === feature.getGeometryName()) {
          continue;
        }

        let tr = document.createElement("tr");
        let th = document.createElement("th");
        let td = document.createElement("td");

        tbody.appendChild(tr);
        tr.appendChild(th);
        tr.appendChild(td);

        th.innerText = prop;
        td.innerText = properties[prop];
      };

      contentRight.appendChild(table);
    }
  });
  /**
   * Add a pointermove handler to the right map to change cursor will hovering an object
   */
  mapRight.on("pointermove", function (event) {
    if (event.dragging) {
      return;
    }
    var pixel = mapRight.getEventPixel(event.originalEvent);
    var hit = mapRight.hasFeatureAtPixel(pixel, {
      layerFilter: function (layer) {
        return layer === vectorLayerRight;
      }
    });
    document.getElementById("map-right").style.cursor = hit ? 'pointer' : 'default';
  });

  areaLayer.getSource().addFeature((new ol.format.GeoJSON()).readFeature(window.app.area, { featureProjection: view.getProjection() }));

  //vectorSource1.addFeature((new ol.format.GeoJSON()).readFeatures(window.app.json, { featureProjection: view.getProjection() }));
  //vectorSource2.addFeature((new ol.format.GeoJSON()).readFeatures(window.app.osm, { featureProjection: view.getProjection() }));

  window.app.json.features.forEach(function (feature) {
    vectorLayerLeft.getSource().addFeature((new ol.format.GeoJSON()).readFeature(feature, { featureProjection: view.getProjection() }));
  });

  window.app.osm.features.forEach(function (feature) {
    vectorLayerRight.getSource().addFeature((new ol.format.GeoJSON()).readFeature(feature, { featureProjection: view.getProjection() }));
  });

  view.fit(areaLayer.getSource().getExtent());
})();
