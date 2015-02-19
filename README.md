# Ember-cli-json-schema

[![Build Status](https://travis-ci.org/southpolesteve/ember-cli-json-schema.svg?branch=master)](https://travis-ci.org/southpolesteve/ember-cli-json-schema)

WARNING: This is still very much a work in progress. It does not yet fully implement the json-schema spec and is missing many critical features. I am currently working directly against master so expect breaking changes at any moment.

## Description

`ember-cli-json-schema` is provides a service that can load json schemas, create objects from schemas, and validate those objects. This addon will inject a `schema` service into your routes that can be used to preform these operations.

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

Handlebars Template:
``` handlebars
{{input value=firstName}}
{{input value=lastName}}

<p>Valid? {{isValid}}</p>

{{#each error in errors}}
  <p class='error'>{{error.field}} - {{error.message}}</p>
{{/each}}
```


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
