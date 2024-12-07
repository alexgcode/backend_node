const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const mongoPlugin = require('@fastify/mongodb');

// Conectar con MongoDB
fastify.register(mongoPlugin, {
  url: 'mongodb+srv://alexgf2703:B2iZWwVttkKqr2Fz@cluster0.r4lwh.mongodb.net/todo-list?retryWrites=true&w=majority&appName=Cluster0', //'mongodb://127.0.0.1:27017/todo-list', // Cambia 'crud_db' por el nombre de tu base de datos
}).after(err => {
  if (err) {
    fastify.log.error('Error al conectar con MongoDB:', err);
    process.exit(1);
  }
});

// Registra el plugin de CORS
fastify.register(cors, {
  origin: '*', // Permitir solicitudes desde cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
});

// Rutas CRUD
fastify.get('/profesores', async (request, reply) => {
  const collection = fastify.mongo.db.collection('profesores');
  const items = await collection.find({}).toArray();
  reply.send(items);
});

fastify.post('/profesores', async (request, reply) => {
  const { nombres, apellidos, telefono, direccion, departamento, estatus, titulacion, especialidad } = request.body;
  if (!nombres || !apellidos || !telefono || !direccion || !departamento || !estatus || !titulacion || !especialidad) {
    return reply.status(400).send({ error: 'Todos los campos son requeridos' });
  }

  try {
    const collection = fastify.mongo.db.collection('profesores');

     // Verifica si la colección está vacía
     const count = await collection.countDocuments();

     // Genera el código de profesor correlativo
     let cod_profesor;
     if (count === 0) {
       cod_profesor = 1; // Comienza desde 1 si no hay documentos
     } else {
       const lastProfessor = await collection
         .find({}, { projection: { cod_profesor: 1 }, sort: { cod_profesor: -1 }, limit: 1 })
         .toArray();
       cod_profesor = lastProfessor[0]?.cod_profesor + 1 || 1;
     }
 

    const result = await collection.insertOne({ cod_profesor, nombres, apellidos, telefono, direccion, departamento, estatus, titulacion, especialidad, createdAt: new Date() });
    reply.send({ id: result.insertedId, cod_profesor });
  }catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: 'Error al registrar el profesor' });
  }
});

fastify.get('/profesores/:id', async (request, reply) => {
  const { id } = request.params;
  const collection = fastify.mongo.db.collection('profesores');
  const item = await collection.findOne({ _id: new fastify.mongo.ObjectId(id) });

  if (!item) {
    return reply.status(404).send({ error: 'Item not found' });
  }

  reply.send(item);
});

fastify.put('/items/:id', async (request, reply) => {
  const { id } = request.params;
  const { name, description } = request.body;

  if (!name || !description) {
    return reply.status(400).send({ error: 'Name and description are required' });
  }

  const collection = fastify.mongo.db.collection('items');
  const result = await collection.updateOne(
    { _id: new fastify.mongo.ObjectId(id) },
    { $set: { name, description, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    return reply.status(404).send({ error: 'Item not found' });
  }

  reply.send({ success: true });
});

fastify.delete('/items/:id', async (request, reply) => {
  const { id } = request.params;
  const collection = fastify.mongo.db.collection('items');
  const result = await collection.deleteOne({ _id: new fastify.mongo.ObjectId(id) });

  if (result.deletedCount === 0) {
    return reply.status(404).send({ error: 'Item not found' });
  }

  reply.send({ success: true });
});

// Iniciar el servidor
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Servidor escuchando en ${address}`);
});