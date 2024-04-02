import { Schema, model, InferSchemaType } from "mongoose"

const AuditSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    changes: {},
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date }
});

type IAudit = InferSchemaType<typeof AuditSchema>
  
const Audit = model('Audit', AuditSchema);

export default Audit

export {
    type IAudit,
    AuditSchema
}