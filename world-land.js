/**
 * Load Natural Earth 110m land outline and expose as WORLD_LAND for globe2d.js.
 * WORLD_LAND = array of rings; each ring = array of [lng, lat].
 * Loaded asynchronously; globe will use it on next frame once available.
 */
(function () {
  window.WORLD_LAND_LOADING = true;
  var url = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_land.geojson';
  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (geojson) {
      var rings = [];
      var features = geojson.features || [];
      for (var f = 0; f < features.length; f++) {
        var geom = features[f].geometry;
        if (!geom || !geom.coordinates) continue;
        var coords = geom.coordinates;
        if (geom.type === 'Polygon') {
          for (var c = 0; c < coords.length; c++) rings.push(coords[c]);
        } else if (geom.type === 'MultiPolygon') {
          for (var p = 0; p < coords.length; p++) {
            for (var c = 0; c < coords[p].length; c++) rings.push(coords[p][c]);
          }
        }
      }
      window.WORLD_LAND = rings;
    })
    .catch(function () { window.WORLD_LAND = []; })
    .then(function () { window.WORLD_LAND_LOADING = false; });
})();
