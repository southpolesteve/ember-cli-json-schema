// https://github.com/json-schema/JSON-Schema-Test-Suite/blob/develop/tests/draft4/required.json
var scenerios = [
    {
        "description": "required validation",
        "schema": {
            "properties": {
                "foo": {},
                "bar": {}
            },
            "required": ["foo"]
        },
        "tests": [
            {
                "description": "present required property is valid",
                "data": {"foo": 1},
                "valid": true
            },
            {
                "description": "non-present required property is invalid",
                "data": {"bar": 1},
                "valid": false
            }
        ]
    },
    {
        "description": "required default validation",
        "schema": {
            "properties": {
                "foo": {}
            }
        },
        "tests": [
            {
                "description": "not required by default",
                "data": {},
                "valid": true
            }
        ]
    }
];


import { test } from 'ember-qunit';
import Schema from 'ember-cli-json-schema/schema';

scenerios.map(function(scenerio){
  module(scenerio.description);
  scenerio.tests.map(function(_test){
    test(_test.description, function() {
      var schema = Schema.create();
      schema.load("test", scenerio.schema);
      var obj = schema.createObject("test", _test.data);
      equal(obj.get('isValid'), _test.valid);
    });
  });
});