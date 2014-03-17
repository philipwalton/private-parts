var test = require('tape');
var Car = require('./fixtures/car');

test('accessor methods', function(t) {

  t.plan(3);

  var honda = new Car();
  honda.drive(1000);
  t.equals(honda.getMileage(), 1000);

  honda.drive(2000);
  t.equals(honda.getMileage(), 3000);

  t.notOk(honda.mileage);
});

test('private methods', function(t) {

  t.plan(7);

  var honda = new Car();
  honda.drive(3000);

  t.equals(honda.getMilesSinceLastOilChange(), 3000);
  t.equals(honda.getMilesSinceLastTireRotation(), 3000);

  honda.drive(3000);
  honda.changeOil();

  t.equals(honda.getMilesSinceLastOilChange(), 0);
  t.equals(honda.changeOil(), 'No oil change is needed at this time.');
  t.equals(honda.getMilesSinceLastTireRotation(), 6000);

  honda.rotateTires();
  t.equals(honda.getMilesSinceLastTireRotation(), 0);
  t.equals(honda.rotateTires(), 'No tire rotation is needed at this time.');

});
