import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    this.schema.load('person', schema );
    var model = this.schema.createObject('person');
    return model;
  }
});

// var schema = {
//   title: "Person",
//   type: "object",
//   properties: {
//     "firstName": {
//       type: "string"
//     },
//     "lastName": {
//       type: "string"
//     },
//     "age": {
//       description: "Age in years",
//       type: "integer"
//     },
//     "parent": {
//       type: 'object',
//       properties: {
//         "sex": {
//           type: "string"
//         },
//         "age": {
//           type: "string"
//         }
//       },
//       required: ["sex", "age"]
//     }
//   },
//   required: ["firstName", "lastName"]
// };

var schema = {
$schema: "http://json-schema.org/draft-04/schema#",
title: "MUSICat_submission",
description: "Describes an artist's submission for juried or moderated inclusion in a collection",
type: "object",
properties: {
id: {
description: "The murfie-platform identifier of this instance, not guaranteed to be unique",
type: "string"
},
submitter_name: {
description: "The name of the person submitting the form.",
type: "string"
},
submitter_email: {
description: "The email address of the person submitting the form.",
type: "string",
format: "email"
},
submission_date: {
description: "The date the form was submitted.",
type: "string",
format: "date-time"
},
artist: {
description: "The artist submitted",
type: "object",
properties: {
name: {
type: "string"
},
bio: {
type: "string"
},
youtube_url: {
type: "string",
format: "uri",
pattern: "youtube"
},
social_media_url: {
type: "string",
format: "uri"
},
website_url: {
type: "string",
format: "uri"
}
},
required: [
"name",
"bio"
]
},
album: {
description: "The album submitted instance",
type: "object",
properties: {
title: {
type: "string"
},
release_date: {
type: "string"
},
record_label: {
type: "string"
},
upc: {
type: "string"
},
tracks: {
type: "array",
items: {
title: "Track",
type: "object",
properties: {
title: {
type: "string"
},
filename: {
type: "string"
},
url: {
type: "string"
},
access_token: {
type: "string"
}
},
required: [
"title",
"filename",
"url",
"access_token"
]
},
minItems: 1,
maxItems: 3,
uniqueItems: true
}
},
required: [
"title",
"release_date",
"tracks"
]
}
},
required: [
"id",
"submitter_email",
"artist",
"album"
],
restricted: [
"submitter_email"
]
};