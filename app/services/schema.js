import Ember from 'ember';
import validator from "npm:is-my-json-valid";

// var JSONSchemaObject = Ember.Object.extend({
//   schema: null,
//   // valid: Ember.computed.empty('errors'),
//   // errors: function(){
//   //   var errors = []
//   //   var required = this.get('requiredProps')

//   //   // Required Properties
//   //   this.get('propNames').map((propName) => {
//   //     if (required.contains(propName) && Ember.isEmpty(this.get(propName))){
//   //       errors.push({field: propName, message: "is empty"})
//   //     }
//   //   })

//   //   return errors
//   // }.property('schema.properties.[]'),

//   setupObservers: function(){
//     var required = this.get('requiredProps');
//     this.set('errors', {});

//     this.get('propNames').map((propName) => {
//       this.addObserver(propName, ()=>{
//         console.log('fired observer on ' + propName)
//         var propErrors = []
//         if (required.contains(propName) && Ember.isEmpty(this.get(propName))){
//           console.log('generated error')
//           propErrors.push({message: "is empty"})
//         }
//         if (propErrors.length === 0){
//           delete this.errors[propName]
//         } else {
//           this.errors[propName] = propErrors
//         }
//       });
//     })
//   }.on('init'),

//   requiredProps: Ember.computed.alias('schema.required'),

//   propNames: function() {
//     return Ember.keys(this.get('schema.properties'))
//   }.property('schema.properties.[]'),

//   getAttributes: function(){
//     return this.getProperties(this.get('propNames'))
//   }
// })

export default Ember.Object.extend({
  _schemas: {},
  _validators: {},

  load: function(url, name){
    return Ember.$.getJSON(url, (schema) => {
      this.set('_validators.' + name, validator(schema))
      this.set('_schemas.' + name, schema);
    });
  },

  createObject: function(name, proto){
    var schema = this.get('_schemas.' + name);
    var obj = create(schema, proto)
    return obj;
  }

});

var JSObject = Ember.ObjectProxy.extend({
  schema: null,
  proto: null,
  validate: null,
  setupProps: function(){
    this.set('content', this.get('proto') || {})
    this.set('validate', validator(this.get('schema')))

    var walkProps = function(node, parent){
      var nodeProps = []
      if (node.type === 'object'){
        for (var propName in node.properties){
          var name
          if (parent) {
            name = parent + "." + propName
          } else {
            name = propName
          }
          nodeProps.push(name)
          nodeProps.push.apply(nodeProps, walkProps(node.properties[propName], name))
        }
      } else if (node.type === 'array') {
        nodeProps.push.apply(nodeProps, walkProps(node.items, parent + ".@each"))
      }
      return nodeProps
    }
    var props = walkProps(this.get('schema'))
    console.log(props)

    var _this = this;

    Ember.defineProperty(this, 'errors', Ember.computed.apply(this, props.concat(function(key, value){
      var validate = _this.get('validate')
      validate(_this.get('content'))
      console.log('validated content')
      return validate.errors
    })));

    // Ember.defineProperty(this, 'requiredErrors', Ember.computed.apply(this, requiredProps.concat(function(key, value){
    //   return requiredProps.map(function(propName){
    //     if (Ember.isEmpty(_this.get(propName))){
    //       return { field: propName, message: "is empty" }
    //     }
    //   }).filter(function(e){return e});
    // })));

    // Ember.defineProperty(this, 'typeErrors', Ember.computed.apply(this, props.concat(function(key, value){
    //   return props.map(function(propName){
    //     return this.get(propName)
    //   }).filter(function(e){return e});
    // })));

  }.on('init'),

  valid: Ember.computed.empty('errors')

  // errors: function(){
  //   var errors = {}
  //   this.get('requiredErrors').map(function(error){
  //     errors[error.field] = errors[error.field] || []
  //     errors[error.field].push(error.message)
  //   })
  //   return errors
  // }.property('requiredErrors.[]', 'typeErrors.[]'),

  // errorMessages: function(){
  //   var errors = []
  //   this.get('requiredErrors').map(function(error){
  //     errors.push(error.field + " " + error.message)
  //   })
  //   return errors
  // }.property('requiredErrors.[]', 'typeErrors.[]'),

  // valid: Ember.computed.empty('errorMessages')
})

function create(schema, proto){
  if (schema.type === "object"){
    return JSObject.create({schema: schema, proto: proto})
  }
}
