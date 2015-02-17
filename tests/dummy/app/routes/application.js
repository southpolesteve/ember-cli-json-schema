import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    return this.schema.load('https://murfie-schemas.herokuapp.com/schemas/co.MUSICat.submission_schema', 'submission').then(()=>{
      var model = this.schema.createObject('submission');
      model.get('album.tracks').pushObjects([{}, {}, {}, {}]);
      return model;
    });
  }
});