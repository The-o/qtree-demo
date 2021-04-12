EARTH_RADIUS = 6378137 // Радиус Земли по экватору
EARTH_EQUATOR_LENGTH = 2 * Math.PI * EARTH_RADIUS // Длина экватора
WGS64_E      = 0.0818191908426; // Эксцентриситет эллипса, лежащего в основе WGS84
DEG_TO_RAD   = Math.PI / 180;
HALF_EQUATOR = EARTH_EQUATOR_LENGTH / 2; // Пол-экватора

/**
 * Переводит координаты из системы WGS84 в координаты проекции Меркатора с шириной-высотой карты,
 * равной длине экватора в метрах
 *
 * @see https://wiki.gis-lab.info/w/Пересчет_координат_из_Lat/Long_в_проекцию_Меркатора_и_обратно#.D0.A2.D0.B5.D0.BE.D1.80.D0.B8.D1.8F
 *
 * @param {Number[]} geo Координаты точки в системе WGS84
 * @param {?bool} latlng Если true, значит в geo сначала идёт долгота, а потом широта
 *
 * @returns {Number[]}
 */
geoToMercator = function (geo, latlng) {
	function restrict(value, min, max) {
		return Math.max(Math.min(value, max), min);
	}

	function longitudeToX(lng) {
		return EARTH_RADIUS * restrict(lng * DEG_TO_RAD, -Math.PI, Math.PI);
	}

	function latitudeToY(lat) {
		var latitude = restrict(lat * DEG_TO_RAD, -Math.PI + 1e-10, Math.PI - 1e-10);
		var eSinLat  = WGS64_E * Math.sin(latitude);

		var tanPt = Math.tan(Math.PI * 0.25 + latitude * 0.5);
		var powPt = Math.pow((1 - eSinLat)/(1 + eSinLat), WGS64_E / 2);

		return EARTH_RADIUS * Math.log(tanPt * powPt);
	}

	return [HALF_EQUATOR + longitudeToX(geo[latlng ? 1 : 0]), HALF_EQUATOR - latitudeToY(geo[latlng ? 0 : 1])];

}
