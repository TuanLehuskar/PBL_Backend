const dataDUT1 = require("../Data/dut1Data");
const dataDUT2 = require("../Data/dut2Data");
const dataDUT3 = require("../Data/dut3Data");
const dataDUTCenter = require("../Data/dutCenterData");

const distanceCal = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính trái đất trong kilômét
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const delta_phi = ((lat2 - lat1) * Math.PI) / 180;
  const delta_lambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(delta_phi / 2) * Math.sin(delta_phi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(delta_lambda / 2) *
      Math.sin(delta_lambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d * 1000;
};

const findNearestMarkers = (markers, lat, lng) => {
  const nearestMarkers = [];

  function addDistance(item, distance) {
    return {
      ...item,
      distance: distance,
    };
  }

  markers.forEach((marker) => {
    const latitude = marker.geoCode[0];
    const longitude = marker.geoCode[1];
    const distance = distanceCal(lat, lng, latitude, longitude);
    nearestMarkers.push(addDistance(marker, distance));
  });

  nearestMarkers.sort((a, b) => a.distance - b.distance);
  const result = nearestMarkers.slice(0, 3);
  const final = getDataFromNearests(result);
  return final;
};

const getDataFromNearests = (elements) => {
  const newArray = [];
  function addItem(item, value) {
    return {
      ...item,
      value: value,
    };
  }
  elements.map((element) => {
    if (element.popup == "HKB-1") {
      newArray.push(addItem(element, dataDUT1));
    } else if (element.popup == "HKB-2") {
      newArray.push(addItem(element, dataDUT2));
    } else if (element.popup == "HKB-3") {
      newArray.push(addItem(element, dataDUT3));
    } else if (element.popup == "HKB-Center") {
      newArray.push(addItem(element, dataDUTCenter));
    }
  });
  return newArray;
};

module.exports = { distanceCal, findNearestMarkers };
