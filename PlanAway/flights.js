const fetch = require('node-fetch');
const querystring = require('querystring')

const baseURL = 'https://apim.expedia.com/x/mflights/search?';
const apiKey = '97207D3A-35EA-4685-947B-E92E0AE3EEAC';

function getFlightDetails(srcAirport, destAirport, deptDate) {
    var params = {
        departureDate: deptDate,
        departureAirport: srcAirport,
        arrivalAirport: destAirport,
        numberOfAdultTravelers: 1,
        maxOfferCount: 1
    };
    var queryParams = querystring.stringify(params);
    var url = baseURL + queryParams;

    return fetch(url, { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'key' : apiKey },
        })
        .then(res => res.json());
}

function getAverageFlightCost(srcAirport, destAirport, deptDate) {
    var params = {
        departureDate: deptDate,
        departureAirport: srcAirport,
        arrivalAirport: destAirport,
        numberOfAdultTravelers: 1,
        maxOfferCount: 5
    };
    var queryParams = querystring.stringify(params);
    var url = baseURL + queryParams;

    return fetch(url, { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'key' : apiKey },
        })
        .then(res => res.json())
        .then((res) => {
            var sumCost = 0;
            var numOffers = 0;
            for (offer in res.offers) {
                numOffers++;
                sumCost += offer.totalFare;
            }
            return sumCost / numOffers;
        });
}

module.exports = getFlightDetails;