import Ember from 'ember';

export default Ember.Object.extend({
  _schemas: {},
  _validators: {},

  load: function(name, schema){
    this.set('_schemas.' + name, schema);
    return this;
  },

  createObject: function(name, data){
    return create(this.get('_schemas.' + name), data);
  }

});

function create(schema, initData){
  if (schema.type === "array"){
    return JSArrayProxy.create({_schema: schema, content: []});
  } else {
    return JSObject.create({_schema: schema, _initData: initData});
  }
}

var JSArrayProxy = Ember.ArrayProxy.extend({});

JSArrayProxy.reopen({
  replaceContent: function(idx, amt, objects) {
    if (objects) {
      var schema = this.get('_schema.items');
      objects = objects.map(function(obj){ return create(schema, obj); });
    }
    this._super(idx, amt, objects);
  },

  isValid: Ember.computed.empty('errors'),

  errors: function(){
    var errors = [];
    if (this.get('content.length') > this.get('_schema.maxItems')) {
      errors.push({field: 'base', message: 'too many items in array'});
    }
    if (this.get('content.length') < this.get('_schema.minItems')) {
      errors.push({field: 'base', message: 'too few items in array'});
    }
    return errors;
  }.property('content.[]')
});

var JSObject = Ember.Object.extend({
  _schema: null,
  _initData: null,
  _required: Ember.computed.alias('_schema.required'),
  _props: Ember.computed('_schema.properties', function(){
    return Ember.keys(this.get('_schema.properties'));
  }),

  setup: function(){
    this._initProps();
    if (this.get('_required')){ this._setupRequiredErrors(); }
    // this._setupTreeErrors();
  }.on('init'),

  _initProps: function(){
    var self = this;
    this.get('_props').map(function(name){
      var subSchema = self.get('_schema.properties')[name];
      var type = subSchema.type;
      switch (type) {
        case "array":
          self.set(name, create(subSchema));
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
          self.set(name, create(subSchema));
          break;
        case "string":
          self.set(name, self.get('_initData.' + name));
          break;
        default:
          self.set(name, self.get('_initData.' + name));
      }
    });
  },

  _setupRequiredErrors: function(){
    var required = this.get('_required');
    var self = this;
    Ember.defineProperty(this, 'requiredErrors', Ember.computed.apply(this, required.concat(function(){
      return required.map(function(prop){
        if (Ember.isEmpty(self.get(prop))){
          return { field: prop, message: "is empty" };
        }
      }).filter(function(e){return e;});
    })));
  },

  _setupTreeErrors: function(){
    // var props = this.get('props');
    // var self = this;
    // Ember.defineProperty(this, 'requiredErrors', Ember.computed.apply(this, required.concat(function(key, value){
    //   return required.map(function(prop){
    //     if (Ember.isEmpty(self.get(prop))){
    //       return { field: prop, message: "is empty" }
    //     }
    //   }).filter(function(e){return e});
    // })));
  },

  errors: Ember.computed.alias('requiredErrors'),
  isValid: Ember.computed.empty('errors'),

  childErrors: function(){
    var props = this.get('_props');
    var self = this;
    if (Ember.isArray(props)){
      return props.map(function(propName){
        var errors = self.get(propName+'.errors');
        if (Ember.isArray(errors)){
          return errors.map(function(error){
            return {field: propName + "." + error.field, message: error.message };
          });
        }
      })
      .filter(function(e){return e;})
      .reduce(function(a, b) {
        return a.concat(b);
      });
    }
  },

  treeErrors: function(){
    return this.get('errors').concat(this.get('childErrors'));
  }.property()
});