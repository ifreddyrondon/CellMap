$(document).ready(function() {
    // contenedor del archivo
    var fileInput = document.getElementById('fileInput');

    var data = [];
    var circles = [];
    var labels = [];

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
            change: function() {
                circleOptions.radius = radiosSlider.val();
                updateCircles(circleOptions.radius);
                centerMap();
            }
        });
        // inicializar mapa
        this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        // inicializar bandas para centrar automaticamente
        this.bounds = new google.maps.LatLngBounds();

        // centrar automaticamente
        this.map.fitBounds(this.bounds);

        // inicializar lector de archivos
        var fr = new FileReader();
        // evento de lectura de archivo
        fr.onload = function(e) {
            var dat = fr.result;
            if (dat === null || dat === undefined || dat === "") return;

            var JSONObject = JSON.parse(dat);


            for (var i = 1; i < JSONObject.length; i++) {
                var coord = JSONObject[i];
                var apGPSs = coord.apGPSs;
                var apOlaps = coord.apOlaps;

                //anado coordenadas no solapadas
                _.each(apGPSs, function(item, j) {
                    if (item.lat != 0)
                        data.push([new google.maps.LatLng(item.lat, item.lng)]);
                });

                //anado coordenadas solapadas
                _.each(apOlaps, function(item, j) {
                    if (item.lat != 0)
                        data.push([new google.maps.LatLng(item.lat, item.lng)]);
                });
            };

            console.log("data size "+data.length);

            // recorrer lineas
            _.each(data, function(cell, index) {
                // generar color salteado
                // var color = index % 2 ? circleOptions.color1 : circleOptions.color2;

                //unicolor
                var color = "#E61A5F";
                // texto de circulos
                var labelText = "";
                // recorrer las coordenadas de la celda
                _.each(cell, function(item) {
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





        };
        //leer archivo de texto
        var file = fileInput.files[0];
        fr.readAsText(file);
    }

    function updateCircles(radius) {
        _.each(circles, function(circle) {
            circle.setRadius(Number(radius));
        });
    }

    // generar un color random
    function getRandomColor() {
        function c() {
            return Math.floor(Math.random() * 256).toString(16);
        }
        return "#" + c() + c() + c();
    }

    // capturar evento cuando sube el archivo
    fileInput.addEventListener('change', function(e) {
        initialize();
    });

});
