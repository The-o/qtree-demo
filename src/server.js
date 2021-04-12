class Server {

    constructor() {
        this.tree = new QTree({
            w: EARTH_EQUATOR_LENGTH,
            h: EARTH_EQUATOR_LENGTH,
            maxItems: 100,
            maxDepth: 12
        });

        for (let office of officesData) {
            const mercatorCoords = geoToMercator([office.lng, office.lat]);

            this.tree.add(mercatorCoords[0], mercatorCoords[1], office);
        }
    }

    /**
     * Изображает запрос к серверу вроде /get/{path}
     *
     * @param {string} path Путь в дереве
     *
     * @returns {Array.*}
     */
    get(path) {
        return Promise.resolve(this.tree.getSubtree(path).get());
    }
}