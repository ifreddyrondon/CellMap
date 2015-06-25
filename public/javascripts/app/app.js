
$(document).ready(function(){
  // contenedor del archivo
  // var fileInput = document.getElementById('fileInput');

  var data = [];
  var circles = [];
  var labels = [];

  //Celda 1
  data.push([
    new google.maps.LatLng(8.5986,-71.1491771),
    new google.maps.LatLng(8.5986006,-71.1490648),
    new google.maps.LatLng(8.5985832,-71.1490567),
    new google.maps.LatLng(8.5986082,-71.1490044),
    new google.maps.LatLng(8.5985803,-71.1489593),
    new google.maps.LatLng(8.5986075,-71.1489929),
    new google.maps.LatLng(8.5986177,-71.1490217),
    new google.maps.LatLng(8.5986198,-71.1490374),
    new google.maps.LatLng(8.5986006,-71.1489752),
    new google.maps.LatLng(8.5985951,-71.1491278),
    new google.maps.LatLng(8.5986087,-71.1490088),
    new google.maps.LatLng(8.5986179,-71.1489868),
    new google.maps.LatLng(8.5985718,-71.1490706),
    new google.maps.LatLng(8.598611,-71.148988),
    new google.maps.LatLng(8.5986239,-71.14903),
    new google.maps.LatLng(8.5986051,-71.1491655),
    new google.maps.LatLng(8.5986099,-71.1490434)
  ]);

  //Celda 2
  data.push([
    new google.maps.LatLng(8.5984683,-71.1488406),
    new google.maps.LatLng(8.5984925,-71.1488625),
    new google.maps.LatLng(8.5985187,-71.1488967),
    new google.maps.LatLng(8.5985708,-71.1489496),
    new google.maps.LatLng(8.5984841,-71.1488442),
    new google.maps.LatLng(8.5984508,-71.1488348),
    new google.maps.LatLng(8.5985503,-71.1489467),
    new google.maps.LatLng(8.5984254,-71.1488376),
    new google.maps.LatLng(8.5985447,-71.1489347),
    new google.maps.LatLng(8.5984943,-71.1488815),
    new google.maps.LatLng(8.5985123,-71.1488981),
    new google.maps.LatLng(8.5984754,-71.1488358),
    new google.maps.LatLng(8.5985211,-71.1489354)
  ]);

   //Celda 3
   data.push([
    new google.maps.LatLng(8.5982696,-71.1487463),
    new google.maps.LatLng(8.5983786,-71.1488273),
    new google.maps.LatLng(8.5983445,-71.1488135),
    new google.maps.LatLng(8.5982414,-71.1487472),
    new google.maps.LatLng(8.598304,-71.1487903),
    new google.maps.LatLng(8.5983213,-71.1487956),
    new google.maps.LatLng(8.5982788,-71.148759),
    new google.maps.LatLng(8.5983651,-71.148825),
    new google.maps.LatLng(8.5982944,-71.1487736),
    new google.maps.LatLng(8.5983005,-71.1487811),
    new google.maps.LatLng(8.5984122,-71.1488368),
    new google.maps.LatLng(8.5984033,-71.1488313),
    new google.maps.LatLng(8.5983334,-71.1488063)
  ]);

  //Celda 4
  data.push([
    new google.maps.LatLng(8.5982367,-71.1487298),
    new google.maps.LatLng(8.5982215,-71.1487294),
    new google.maps.LatLng(8.5981818,-71.1487429)
  ]);

  //Celda 5
  data.push([
    new google.maps.LatLng(8.5981718,-71.1487355),
    new google.maps.LatLng(8.5981747,-71.1487051),
    new google.maps.LatLng(8.5981637,-71.1487219),
    new google.maps.LatLng(8.5981732,-71.1487347),
    new google.maps.LatLng(8.5981738,-71.1487242),
    new google.maps.LatLng(8.5981488,-71.1486803),
    new google.maps.LatLng(8.5981567,-71.148686)
  ]);

  // funcion principal
  function initialize() {

    // opciones de la visualizacion
    var mapOptions = {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    // opciones de los circulos
    var circleOptions = {
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillOpacity: 0.25,
      radius: 4,
      color1: "#f0b80d",
      color2: "#0d9bed",
      color3: "#54c51c",
    };

    // opciones de los textos
    var textOptions = {
      boxStyle: {
        textAlign: "center",
        fontSize: "10pt",
        fontWeigth: "bold",
        borderRadius: "100%"
      },
      disableAutoPan: true,
      closeBoxURL: "",
      isHidden: false,
      pane: "mapPane",
      enableEventPropagation: true
    };

    // inicializar slider de radio
    var radiosSlider = $('#radius-slider').noUiSlider({
      start: 5,
      step: 1,
      range: {
        'min': 1,
        'max': 10
      },
      format: wNumb({
        decimals: 0
      }),
    });
    $('#radius-slider').noUiSlider_pips({
      mode: 'range',
      density: 10
    });
    // evento de radius slider
    $("#radius-slider").on({
      change: function(){
        circleOptions.radius = radiosSlider.val();
        updateCircles(circleOptions.radius);
        centerMap();
      }
    });
    // inicializar mapa
    this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    // inicializar bandas para centrar automaticamente
    this.bounds = new google.maps.LatLngBounds();

    // recorrer lineas
    _.each(data, function(cell, index){
      // generar color salteado
      var color = index % 2 ? circleOptions.color1 : circleOptions.color2;
      // texto de circulos
      var labelText = "";
      // recorrer las coordenadas de la celda
      _.each(cell, function(item){
        // circulos
        circle = new google.maps.Circle(_.extend(circleOptions, {
          map: this.map,
          center: item,
          strokeColor: color,
          fillColor: color,
        }));
        // textos
        var label = new InfoBox(_.extend(textOptions, {
          content: labelText,
          position: item,
        }));
        label.open(this.map);
        label.setPosition(circle.getCenter());

        // guardando circulos y textos para redimensionar
        circles.push(circle);
        labels.push(label);
        // agregando datos a las bandas para auto ajustar
        this.bounds.extend(item);
      });
    });

    // centrar automaticamente
    this.map.fitBounds(this.bounds);

            // inicializar lector de archivos
            // var fr = new FileReader();
            // evento de lectura de archivo
            // fr.onload = function(e) {
            //   var data = fr.result;
            //   if(data === null || data === undefined || data === "") return;
            //   // leer por lineas
            //   var lines = data.split('\n');
            //   _.each(lines, function(line, i){
            //     // remover el primer y ultimo parentesis
            //     line = line.substring(1, line.length-1);
            //     // buscar primer ]
            //     var pos = line.indexOf(']');
            //     // si no tiene ] pasar a la siguiente
            //     if(pos == -1) return;
            //     // obtener array de macs
            //     var macs = line.substring(1, pos);
            //     // separar por comas y contar los macs
            //     var count = macs.split(',').length;
            //     // obtener array de coordenadas
            //     var coords = line.substring(pos + 4, line.length - 1);
            //     // separar por comas las coordenadas
            //     // coords = JSON.parse(coords);
            //     console.log(coords);


            //   // lineSplit = line.split(',');
            //     console.log(coords);
            //   });
            // };
            // // leer archivo de texto
            // var file = fileInput.files[0];
            // fr.readAsText(file);
  }

  function updateCircles(radius){
    _.each(circles, function(circle){
      circle.setRadius(Number(radius));
    });
  }

  // generar un color random
  function getRandomColor(){
    function c(){
      return Math.floor(Math.random()*256).toString(16);
    }
    return "#"+c()+c()+c();
  }

  // capturar evento cuando sube el archivo
  // fileInput.addEventListener('change', function(e) {
    // initialize();
  // });

  initialize();
});