import fields from './fields';
import SchemaDefinition from './SchemaDefinition';
import AnnotationDefinition from './Annotation';

/**
 @name SequenceDefinition
 @description
 A sequence, typically of a part and a large string. Sequences are references because they are not usually loaded in the applicaiton, and may be very large, so can be loaded with their own API for defining desired regions.
*/

const SequenceDefinition = new SchemaDefinition({
  id: [
    fields.id(),
    `ID corresponding to file for associated sequence`,
  ],

  annotations: [
    fields.arrayOf(AnnotationDefinition.validate),
    `List of Annotations associated with the sequence`,
  ],

  length: [
    fields.number(),
    `Length of the sequence (calculated on the server)`,
  ],
});

export default SequenceDefinition;
