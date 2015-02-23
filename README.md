# Ember-cli-json-schema

[![Build Status](https://travis-ci.org/southpolesteve/ember-cli-json-schema.svg?branch=master)](https://travis-ci.org/southpolesteve/ember-cli-json-schema)

WARNING: This is still very much a work in progress. It does not yet fully implement the [JSON Schema](http://json-schema.org/) spec and is missing many critical features. I am currently working directly against master so expect breaking changes at any moment.

## Description

`ember-cli-json-schema` is provides a service that can load json schemas, create objects from schemas, and validate those objects. This addon will inject a `schema` service into your routes that can be used to preform schema related operations. The purpose is to help form authors easily validate and display errors for data conforming to the json schema spec.

## Support / Disclaimer

This add-on attempts to comply with the [JSON Schema](http://json-schema.org/). As currently written, it does not support the full specification. It also lacks support for some "simple" schemas. Currently this means that your schema's root object must specify a type of `array` or `object`.


## Installation

`ember install:addon ember-cli-json-schema`

## Usage

Route:
``` javascript
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
}

export default Ember.Route.extend({
  model: function(){
    this.schema.load('Person', schema );
    var model = this.schema.createObject('Person');
    return model;
  }
})
```

Handlebars Template:
``` handlebars
{{input value=firstName}}
{{input value=lastName}}

<p>Valid? {{isValid}}</p>

{{#each error in errors}}
  <p class='error'>{{error.field}} - {{error.message}}</p>
{{/each}}
```

### API

`schema.load(name, schema)`

#### Parameters

name - string - Name of the schmea to be loaded. You will reference this later to create an object
schema - object - This is the schema itself

returns: null

`schema.createObject(name)`

#### Parameters

name - string - Name of the schmea to be used to create the object

returns: schema object instance

`schemaObject.errors`

#### Parameters

returns: array of errors on the current level of the schema object

`schemaObject.childErrors`

#### Parameters

returns: array of errors on below the current level of the schema object

`schemaObject.treeErrors`

#### Parameters

returns: array of errors on the current level or below of the schema object

`schemaObject.isValid`

#### Parameters

returns: boolean. If no errors exist on the current level of the object

`schemaObject.isTreeValid`

#### Parameters

returns: boolean. If no errors exist on or below the current level of the object



## Contributing

* `git clone` this repository
* `npm install`
* `bower install`

### Running

* `ember server`
* Visit your app at http://localhost:4200.

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
