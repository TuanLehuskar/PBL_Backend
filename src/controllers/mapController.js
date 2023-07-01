const mongoose = require("mongoose");
const Data = require("../models/dataModel");
const { multiplierLastValue } = require("../Data/dataUtils");
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

const findNearestMarkers = (markers, lat, lng, lastDocument) => {
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
  const final = getDataFromNearests(result, lastDocument);
  return final;
};
const processObject = (data) => {
  const newData = {
    temperature: data.field1,
    humidity: data.field2,
    pm25: data.field3,
    pm10: data.field4,
    CO: data.field5,
    poisonGas: data.field6,
  };
  return newData;
};
const getDataFromNearests = (elements, lastDocument) => {
  const newArray = [];
  function addItem(item, value) {
    return {
      ...item,
      value: value,
    };
  }
  const output = processObject(lastDocument);
  elements.map((element) => {
    if (element.popup == "HKB-1") {
      newArray.push(addItem(element, output));
    } else if (element.popup == "HKB-2") {
      newArray.push(addItem(element, multiplierLastValue(output)));
    } else if (element.popup == "HKB-3") {
      newArray.push(addItem(element, multiplierLastValue(output)));
    } else if (element.popup == "HKB-Center") {
      newArray.push(addItem(element, multiplierLastValue(output)));
    }
  });
  return newArray;
};

module.exports = { distanceCal, findNearestMarkers };
