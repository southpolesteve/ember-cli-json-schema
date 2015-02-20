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
  } else if (schema.type === "object") {
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
  _errorProps: [],
  _childrenProps: [],
  _required: Ember.computed.alias('_schema.required'),
  _props: Ember.computed('_schema.properties', function(){
    return Ember.keys(this.get('_schema.properties'));
  }),

  setup: function(){
    this._initProps();
    this._setupErrorProps();
  }.on('init'),

  _initProps: function(){
    var self = this;
    this.get('_props').map(function(name){
      var subSchema = self.get('_schema.properties')[name];
      var type = subSchema.type;
      switch (type) {
        case "array":
          self.set(name, create(subSchema));
          // SETUP ARRAY OBSERVERS ( minItems, maxItems )
          break;
        case "boolean":
          console.error("Property type of boolean is not implemented yet");
          break;
        case "integer":
          console.error("Property type of integer is not implemented yet");
          break;
        case "number":
          console.error("Property type of number is not implemented yet");
          break;
        case "null":
          console.error("Property type of null is not implemented yet");
          break;
        case "object":
          self.get('_childrenProps').push(name);
          self.set(name, create(subSchema));
          // SETUP OBJECT OBSERVERS (required, minProps, maxProps, allOf, oneOf, etc)
          break;
        case "string":
          self.set(name, self.get('_initData.' + name));
          break;
        default:
          console.error("Proprety " + name + " did not specify a type. May result in unexpected behavior");
          self.set(name, self.get('_initData.' + name));
      }
    });
  },

  _setupErrorProps: function(){
    var self = this;
    var requiredProps = this.get('_required') || [] ;
    var propsWithPattern = this.get('_props').filter(function(propName){
      return self.get('_schema.properties.' + propName + '.pattern');
    });
    var propsWithFormat = this.get('_props').filter(function(propName){
      return self.get('_schema.properties.' + propName + '.format');
    });

    requiredProps.map(function(propName){
      var privatePropName = "_errors-" + propName + "-required";
      self.get('_errorProps').push(privatePropName);
      Ember.defineProperty(self, privatePropName , Ember.computed(propName, function(){
        if (Ember.isEmpty(self.get(propName))){
          return { field: propName, message: "is empty" };
        }
      }));
    });

    propsWithPattern.map(function(propName){
      var privatePropName = "_errors-" + propName + "-pattern";
      self.get('_errorProps').push(privatePropName);
      Ember.defineProperty(self, privatePropName , Ember.computed(propName, function(){
        var pattern = self.get('_schema.properties.' + propName + '.pattern');
        var regex = new RegExp(pattern);
        var prop = self.get(propName);
        if (!prop || !prop.match(regex)){
          return { field: propName, message: "does not match pattern '" + pattern +"'"};
        }
      }));
    });

    propsWithFormat.map(function(propName){
      var privatePropName = "_errors-" + propName + "-format";
      self.get('_errorProps').push(privatePropName);
      Ember.defineProperty(self, privatePropName , Ember.computed(propName, function(){
        var format = self.get('_schema.properties.' + propName + '.format');
        var regex = formats[format];
        var prop = self.get(propName);
        if (!prop || !prop.match(regex)){
          return { field: propName, message: "does not match format '" + format +"'"};
        }
      }));
    });

    var errorProps = this.get('_errorProps');

    Ember.defineProperty(this, 'errors', Ember.computed.apply(this, errorProps.concat(function(){
      var errorsArray = [];
      var errorsObject = this.getProperties(errorProps);
      for(var i in errorsObject) {
        errorsArray.push(errorsObject[i]);
      }
      return errorsArray.filter(function(e){return e;});
    })));
  },

  isValid: Ember.computed.empty('errors'),
  isTreeValid: Ember.computed.empty('treeErrors'),
  _children: function(){
    var childrenArray = [];
    var childrenObject = this.getProperties(this.get('_childrenProps'));
    for(var i in childrenObject) {
      childrenArray.push(childrenObject[i]);
    }
    return childrenArray.filter(function(e){return e;});
  }.property('_childrenProps.[]'),

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
  }.property('_children.@each.errors'),

  treeErrors: function(){
    return this.get('errors').concat(this.get('childErrors'));
  }.property('errors.[]','childErrors.[]')
});

// Types and Formats inspired by https://github.com/mafintosh/is-my-json-valid

var checkTypes = {};

checkTypes.any = function() {
  return true;
};

checkTypes.null = function(prop) {
  return prop === null;
};

checkTypes.boolean = function(prop) {
  return Ember.typeof(prop) === "boolean";
};

checkTypes.array = function(prop) {
  return Ember.isArray(prop);
};

checkTypes.object = function(prop) {
  return Ember.typeOf(prop) === "object";
};

checkTypes.number = function(prop) {
  return typeof prop === "number";
};

checkTypes.integer = function(prop) {
  return typeof prop === "number" && ((prop | 0) === prop || prop > 9007199254740992 || prop < -9007199254740992);
};

checkTypes.string = function(prop) {
  return Ember.typeOf(prop) === "string";
};

var formats = {};

formats['date-time'] = /^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-[0-9]{2}[tT ]\d{2}:\d{2}:\d{2}(\.\d+)?([zZ]|[+-]\d{2}:\d{2})$/;
formats['date'] = /^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-[0-9]{2}$/;
formats['time'] = /^\d{2}:\d{2}:\d{2}$/;
formats['email'] = /^\S+@\S+$/;
formats['ip-address'] = formats['ipv4'] = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
formats['ipv6'] = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
formats['uri'] = /^[a-zA-Z][a-zA-Z0-9+-.]*:[^\s]*$/;
formats['color'] = /(#?([0-9A-Fa-f]{3,6})\b)|(aqua)|(black)|(blue)|(fuchsia)|(gray)|(green)|(lime)|(maroon)|(navy)|(olive)|(orange)|(purple)|(red)|(silver)|(teal)|(white)|(yellow)|(rgb\(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*\))|(rgb\(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\))/;
formats['hostname'] = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/;
formats['alpha'] = /^[a-zA-Z]+$/;
formats['alphanumeric'] = /^[a-zA-Z0-9]+$/;
formats['style'] = /\s*(.+?):\s*([^;]+);?/g;
formats['phone'] = /^\+(?:[0-9] ?){6,14}[0-9]$/;
formats['utc-millisec'] = /^[0-9]+(\.?[0-9]+)?$/;