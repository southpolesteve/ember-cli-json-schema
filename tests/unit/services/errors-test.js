import { test } from 'ember-qunit';
import Schema from 'ember-cli-json-schema/schema';

var service = Schema.create();
var schema = {
  title: "Person",
  type: "object",
  properties: {
    "firstName": {
      type: "string"
    },
    "lastName": {
      type: "string"
    },
    "age": {
      description: "Age in years",
      type: "integer"
    }
  },
  required: ["firstName", "lastName"]
};

module("Errors");

test("reports the correct number", function(){
  service.load("test", schema);
  var obj = service.createObject("test");
  equal(obj.get('isValid'), false);
  equal(obj.get('errors').length, 2);
});