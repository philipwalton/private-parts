function Car() {
  _(this).mileage = 0;
  _(this).mileageAtLastOilChange = 0;
  _(this).mileageAtLastTireRotation = 0;
}

// Add methods to the public prototype.
Car.prototype.drive = function(miles) {
  if (typeof miles == 'number' && miles > 0) {
    _(this).mileage += miles;
  } else {
    throw new Error('drive only accepts positive numbers');
  }
};

Car.prototype.getMileage = function() {
  return _(this).mileage;
};

Car.prototype.getMilesSinceLastOilChange = function() {
  return _(this).mileage - _(this).mileageAtLastOilChange;
};

Car.prototype.getMilesSinceLastTireRotation = function() {
  return _(this).mileage - _(this).mileageAtLastTireRotation;
};

Car.prototype.changeOil = function() {
  if ( _(this).shouldChangeOil() ) {
    _(this).mileageAtLastOilChange = _(this).mileage;
  } else {
    return('No oil change is needed at this time.');
  }
};

Car.prototype.rotateTires = function() {
  if ( _(this).shouldRotateTires() ) {
    _(this).mileageAtLastTireRotation = _(this).mileage;
  } else {
    return('No tire rotation is needed at this time.');
  }
};

// Create the 'private prototype'.
var privateMethods = Object.create(Car.prototype);

// Add methods to the 'private prototype'.
privateMethods.shouldChangeOil = function() {
  return this.getMilesSinceLastOilChange() > 5000 ? true : false;
};

privateMethods.shouldRotateTires = function() {
  return this.getMilesSinceLastTireRotation() > 5000 ? true : false;
};

// Create the key function with setting the private methods.
var _ = require('../../').createKey(privateMethods);

module.exports = Car;

