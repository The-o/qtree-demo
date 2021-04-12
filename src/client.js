const server = new Server(officesData);

ymaps.ready(init);

function init(){

    const officesAdded = {};
    const tilesLoaded = {};

    function log (message){
        const log = document.getElementById('log');
        const lines = log.value.split("\n").slice(0,30);
        lines.unshift(message);
        log.value = lines.join("\n");
    }

    function getTilePath(x, y, z) {
        if (z <= 0) {
            return '';
        }

        let path = '';
        let halfSize = 2 ** (z - 1);

        while (z > 0) {
            const idx = (y >= halfSize) * 2 + (x >= halfSize);
            x = x % halfSize;
            y = y % halfSize;
            halfSize = Math.floor(halfSize / 2)
            path = path + idx;
            --z;
        }

        return path;
    }

    function loadOffices(map, x, y, z) {
        const path = getTilePath(x, y, z);
        if (!tilesLoaded[path]) {
            server.get(path).then(
                offices => {
                    log(`Для тайла ${path} получили офисов: ${offices.length}`)
                    tilesLoaded[path] = true;

                    for (office of offices) {
                        if (officesAdded[office.id]) {
                            continue;
                        }
                        const officePoint = getOfficePoint(office);
                        map.geoObjects.add(officePoint);
                        officesAdded[office.id] = true;
                    }
                }
            )
        }
    }

    function getOfficePoint(office) {
        return new ymaps.Placemark(
            [office.lat, office.lng],
            {
                id: Number(office.id),
                balloonContent: office.address
            }, {
                hasBalloon: true,
                hasHint: false,
                iconLayout: officeIconLayout,
                iconShape: {
                    type: 'Rectangle',
                    coordinates: [[-10, -36], [11, 0]]
                }
            }
        );
    }

    const officeIconLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="map_point"><div>'
    );

    const map = new ymaps.Map("map", {
        center: [55.751401,37.618916],
        zoom: 14
    });

    const loadingLayer = new ymaps.Layer((tileCoords, tileZoom) => {
        loadOffices(map, tileCoords[0], tileCoords[1], tileZoom);
        return null;
    }, {
        tileTransparent: true,
        tileSize: [256, 256]
    })

    map.layers.add(loadingLayer);
}