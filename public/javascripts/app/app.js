$(document).ready(function() {

    $('.checkbox').hide();

    // contenedor del archivo
    var fileInput = document.getElementById('fileInput');

    // opciones de la visualizacion
    var mapOptions = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{
                "saturation": 36
            }, {
                "color": "#000000"
            }, {
                "lightness": 40
            }]
        }, {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#000000"
            }, {
                "lightness": 16
            }]
        }, {
            "featureType": "all",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 20
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 17
            }, {
                "weight": 1.2
            }]
        }, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 20
            }]
        }, {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 21
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 17
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 29
            }, {
                "weight": 0.2
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 18
            }]
        }, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 16
            }]
        }, {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 19
            }]
        }, {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 17
            }]
        }]
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
            borderRadius: "100%",
            color: "#fff",
        },
        disableAutoPan: true,
        closeBoxURL: "",
        isHidden: false,
        pane: "mapPane",
        enableEventPropagation: true
    };


    var data = [];
    var circles = [];
    var labels = [];

    // funcion principal
    function initialize() {
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
        }, true);
        $('#radius-slider').noUiSlider_pips({
            mode: 'range',
            density: 10
        });
        // evento de radius slider
        $("#radius-slider").on({
            change: function() {
                circleOptions.radius = radiosSlider.val();
                updateCircles(circleOptions.radius);
            }
        });

        //show/hide labels
        $('#check').click(function() {
            //Se verifica si alguno de los checks esta seleccionado
            if ($('input[name="option"]').is(':checked')) {
                showLabels();
            } else {
                hideLabels();
            }
        });

        // inicializar mapa
        this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        // inicializar bandas para centrar automaticamente
        this.bounds = new google.maps.LatLngBounds();

        // inicializar lector de archivos
        var fr = new FileReader();
        //leer archivo de texto
        var file = fileInput.files[0];
        fr.readAsText(file);

        // evento de lectura de archivo
        fr.onload = function(e) {
            var dat = fr.result;
            if (dat === null || dat === undefined || dat === "") return;

            // transformacion de archivo a JSON
            var JSONObject = JSON.parse(dat);

            // recorremos los objetos dentro del json para construir las celdas
            _.each(JSONObject, function(item, index) {
                // generar color salteado
                var color = index % 2 ? circleOptions.color1 : circleOptions.color2;
                // texto interno de los circulos
                var labelText = String(item.count);
                // circulos de cada celda por si hay solpadas
                var celCircles = {};

                
                // coordenadas por cada celda
                _.each(item.apGPSs, function(coord) {
                    // validacion de las coord
                    if (!coord.lat || coord.lat == '0' || !coord.lng || coord.lng == '0') return;
                    var LatLng = new google.maps.LatLng(coord.lat, coord.lng);
                    // generacion de circulos
                    var circle = new google.maps.Circle(_.extend(circleOptions, {
                        map: this.map,
                        center: LatLng,
                        strokeColor: color,
                        fillColor: color,
                        id: coord.lat + coord.lng,
                    }));
                    // guardamos circulos de cada celda por si hay solapados
                    if (!celCircles[circle.id]) celCircles[circle.id] = circle;

                    // generacion de labels
                    var label = new InfoBox(_.extend(textOptions, {
                        content: labelText,
                        position: LatLng,
                    }));
                    label.open(this.map);
                    label.setPosition(circle.getCenter());

                    // guardando circulos y textos para redimensionar
                    circles.push(circle);
                    labels.push(label);
                    // agregando datos a las bandas para auto ajustar
                    this.bounds.extend(LatLng);
                });

                // coordenadas solapadas
                if (item.apOlaps.length > 0) {
                    // recorremos las coordendas solapadas
                    _.each(item.apOlaps, function(olap) {
                        // obtemos un id para buscar en el dict de circles por celda
                        console.log(olap.lat + ", " + olap.lng + circle);
                        var id = olap = olap.lat + olap.lng;
                        // buscamos el id en el dict
                        var circle = celCircles[id];

                        // cambiamos el color
                        // circle.strokeColor = circleOptions.color3;
                        // circle.fillColor = circleOptions.color3;



                    });
                }
            });

            // centrar mapa
            centerMap();
        };

        $('.checkbox').show();
    }

    // HELPERS ------------------------------------------//
    // funcion para actualizar los radios de los circulos
    function updateCircles(radius) {
        _.each(circles, function(circle) {
            circle.setRadius(Number(radius));
        });
    }

    // funcion para centrar mapa automaticamente
    function centerMap() {
        this.map.fitBounds(this.bounds);
    }

    // funcion para generar un color random
    function getRandomColor() {
        function c() {
            return Math.floor(Math.random() * 256).toString(16);
        }
        return "#" + c() + c() + c();
    }

    function hideLabels() {
        _.each(labels, function(label) {
            label.close(this.map);
        });
    }

    function showLabels() {
        _.each(labels, function(label) {
            label.open(this.map);
        });
    }


    // INIT -----------------------------------------------//
    // capturar evento cuando sube el archivo e iniciar todo
    fileInput.addEventListener('change', function(e) {
        initialize();

    });



});
