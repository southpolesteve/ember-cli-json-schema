import Ember from 'ember';

export default Ember.Object.extend({
  _schemas: {},
  _validators: {},

  load: function(url, name){
    return Ember.$.getJSON(url, (schema) => {
      this.set('_schemas.' + name, schema);
    });
  },

  createObject: function(name){
    var schema = this.get('_schemas.' + name);
    var obj = create(schema)
    return obj;
  }

});

function create(schema){
  if (schema.type === "object"){
    return JSObject.create({_schema: schema})
  } else if (schema.type === "array"){
    return JSArrayProxy.create({_schema: schema, content: []})
  }
}

var JSArrayProxy = Ember.ArrayProxy.extend({})

JSArrayProxy.reopen({
  replaceContent: function(idx, amt, objects) {
    if (objects) {
      var schema = this.get('_schema.items');
      objects = objects.map((obj) => { return create(schema) })
    }
    this._super(idx, amt, objects)
  },

  isValid: Ember.computed.empty('errors'),

  errors: function(){
    var errors = []
    if (this.get('content.length') > this.get('_schema.maxItems')) {
      errors.push({field: 'base', message: 'too many items in array'})
    }
    return errors
  }.property('content.[]')
})

var JSObject = Ember.Object.extend({
  setup: function(){
    this._initProps()
    this._setupRequiredErrors()
  }.on('init'),

  _schema: null,
  _required: Ember.computed.alias('_schema.required'),
  _props: Ember.computed('_schema.properties', function(){
    return Ember.keys(this.get('_schema.properties'))
  }),

  _initProps: function(){
    var self = this;
    this.get('_props').map(function(name){
      var subSchema = self.get('_schema.properties')[name]
      var type = subSchema.type
      switch (type) {
        case "array":
          self.set(name, create(subSchema))
          break;
        case "boolean":
          break;
        case "integer":
          break;
        case "number":
          break;
        case "null":
          console.error("Property type of null is not implemented yet");
          break;
        case "object":
          self.set(name, create(subSchema))
          break;
        case "string":
          self.set(name)
          break;
        default:
          console.error("You did not indicate a valid type in your json schema for property: ", name);
      }
    })
  },

  _setupRequiredErrors: function(){
    var required = this.get('_required');
    var self = this;
    Ember.defineProperty(this, 'requiredErrors', Ember.computed.apply(this, required.concat(function(key, value){
      return required.map(function(prop){
        if (Ember.isEmpty(self.get(prop))){
          return { field: prop, message: "is empty" }
        }
      }).filter(function(e){return e});
    })));
  },

  errors: Ember.computed.alias('requiredErrors'),
  isValid: Ember.computed.empty('errors'),

  childErrors: function(){

  }
})


// array
// A JSON array.
// boolean
// A JSON boolean.
// integer
// A JSON number without a fraction or exponent part.
// number
// Any JSON number. Number includes integer.
// null
// The JSON null value.
// object
// A JSON object.
// string
// A JSON string.