import mongoose, { Document, Schema } from 'mongoose';
import Counter from './counter';

// Definição da interface para o modelo
export interface IInfoEsp extends Document {
  id: number;
  temperatura: number;
  umidade: number;
  data: Date;
}

// Definição do esquema
const InfoEspSchema: Schema = new Schema({
  id: { type: Number, unique: true }, 
  temperatura: { type: Number, required: true },
  umidade: { type: Number, required: true },
  data: { type: String}, // A data será gerada automaticamente no momento do cadastro
});

// Middleware para incrementar o campo `id` antes de salvar
InfoEspSchema.pre<IInfoEsp>('save', async function (next) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: 'infoEsp' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter!.seq;
      next();
    } catch (erro) {
      next();
    }
  });
  
  // Criação do modelo
  const InfoEsp = mongoose.model<IInfoEsp>('InfoEsp', InfoEspSchema);
  
  export default InfoEsp;
