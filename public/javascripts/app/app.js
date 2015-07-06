$(document).ready(function() {

    $('.checkbox').hide();

    // contenedor del archivo
    var fileInput = document.getElementById('fileInput');

    // opciones de la visualizacion
    var mapOptions = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles:

            [{
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{
                "color": "#e9e9e9"
            }, {
                "lightness": 17
            }]
        }, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                "color": "#f5f5f5"
            }, {
                "lightness": 20
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#ffffff"
            }, {
                "lightness": 17
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#ffffff"
            }, {
                "lightness": 29
            }, {
                "weight": 0.2
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "color": "#ffffff"
            }, {
                "lightness": 18
            }]
        }, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "color": "#ffffff"
            }, {
                "lightness": 16
            }]
        }, {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                "color": "#f5f5f5"
            }, {
                "lightness": 21
            }]
        }, {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{
                "color": "#dedede"
            }, {
                "lightness": 21
            }]
        }, {
            "elementType": "labels.text.stroke",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#ffffff"
            }, {
                "lightness": 16
            }]
        }, {
            "elementType": "labels.text.fill",
            "stylers": [{
                "saturation": 36
            }, {
                "color": "#333333"
            }, {
                "lightness": 40
            }]
        }, {
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [{
                "color": "#f2f2f2"
            }, {
                "lightness": 19
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#fefefe"
            }, {
                "lightness": 20
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#fefefe"
            }, {
                "lightness": 17
            }, {
                "weight": 1.2
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
        color3: "#F32B44",
        color4: "#000000",
    };

    // opciones de los textos
    var textOptions = {
        boxStyle: {
            textAlign: "center",
            fontSize: "10pt",
            borderRadius: "100%",
            color: "#000",
        },
        disableAutoPan: true,
        closeBoxURL: "",
        isHidden: false,
        pane: "mapPane",
        enableEventPropagation: true,
    };


    var data = [];
    var circles = [];
    var labels = [];
    var overlap = {};

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


        $('#check3').click(function() {
            //Se verifica si alguno de los checks esta seleccionado
            if ($('input[name="option3"]').is(':checked')) {
                showGPSCircle();
            } else {
                hideGPSCircle();
            }
        });

        $('#check2').click(function() {
            //Se verifica si alguno de los checks esta seleccionado
            if ($('input[name="option2"]').is(':checked')) {
                showOverlap();
            } else {
                hideOverlap();
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

        var celCircles = {};
        var celLabels = {};

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
                        id: coord.lat + coord.lng,
                    }));

                    // guardamos labels de cada celda por si hay solapados
                    if (!celLabels[label.id]) celLabels[label.id] = label;

                    label.open(this.map);
                    label.setPosition(circle.getCenter());
                    // guardando circulos y textos para redimensionar
                    circles.push(circle);
                    labels.push(label);
                    // agregando datos a las bandas para auto ajustar
                    this.bounds.extend(LatLng);
                });
            });

            _.each(JSONObject, function(item, index) {
                // coordenadas solapadas
                if (item.apOlaps.length > 0) {
                    // recorremos las coordendas solapadas
                    _.each(item.apOlaps, function(olap) {
                        var id = olap.lat + olap.lng;

                        if (celCircles[id] != undefined) {
                            var diff = olap.id - item.vcellid;
                            if (diff <= 1) {
                                celCircles[id].strokeColor = circleOptions.color3;
                                celCircles[id].fillColor = circleOptions.color3;
                            } else {
                                celCircles[id].strokeColor = circleOptions.strokeColor.color4;
                                celCircles[id].fillColor = circleOptions.fillColor.color4;
                            }


                        }
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

    function showGPSCircle() {
        _.each(circles, function(circle) {
            circle.setMap(this.map);
        });
    }

    function hideGPSCircle() {
            _.each(circles, function(circle) {
                circle.setMap(null);
            });
        }
        // INIT -----------------------------------------------//
        // capturar evento cuando sube el archivo e iniciar todo
    fileInput.addEventListener('change', function(e) {
        initialize();

    });



});
