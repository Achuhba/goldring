let map

// Инициализация карты
ymaps.ready(init)

function init() {
	map = new ymaps.Map('map', {
		center: [55.76, 37.64], // Центр карты (Москва)
		zoom: 5,
	})
}

// Функция для поиска маршрутов
async function findRoutes() {
	const city = document.getElementById('city').value
	const time = parseFloat(document.getElementById('time').value)
	const speed = parseFloat(document.getElementById('speed').value)

	if (!city || !time || !speed || time <= 0 || speed <= 0) {
		alert('Пожалуйста, заполните все поля корректно!')
		return
	}

	// Получаем координаты выбранного города
	const cityCoords = await ymaps.geocode(city).then(function (res) {
		return res.geoObjects.get(0).geometry.getCoordinates()
	})

	// Список городов для проверки
	const cities = [
		{ name: 'Владимир', coords: null },
		{ name: '', coords: null },
		{ name: '', coords: null },
		{ name: '', coords: null },
		{ name: '', coords: null },
		{ name: '', coords: null },
		{ name: '', coords: null },
		{ name: 'Калининград', coords: null },
	]

	// Получаем координаты для всех городов
	for (let i = 0; i < cities.length; i++) {
		cities[i].coords = await ymaps.geocode(cities[i].name).then(function (res) {
			return res.geoObjects.get(0).geometry.getCoordinates()
		})
	}

	// Очищаем карту
	map.geoObjects.removeAll()

	// Рассчитываем максимальное расстояние
	const maxDistance = speed * time // Максимальное расстояние (км)

	// Строим маршруты до подходящих городов
	for (let i = 0; i < cities.length; i++) {
		const distance = await calculateDistance(cityCoords, cities[i].coords)
		if (distance <= maxDistance && cities[i].name !== city) {
			// Создаем маршрут
			const multiRoute = new ymaps.multiRouter.MultiRoute(
				{
					referencePoints: [cityCoords, cities[i].coords],
					params: {
						routingMode: 'auto', // Режим маршрутизации (авто)
					},
				},
				{
					boundsAutoApply: true,
				}
			)

			// Добавляем маршрут на карту
			map.geoObjects.add(multiRoute)
		}
	}

	// Центрируем карту на выбранном городе
	map.setCenter(cityCoords, 7)
}

// Функция для расчета расстояния между двумя точками
function calculateDistance(coords1, coords2) {
	return ymaps.coordSystem.geo.getDistance(coords1, coords2) / 1000 // Расстояние в км
}
